const config = require('./config');
const GitHubApi = require('github');

class Bot {

  constructor() {
    this.github = new GitHubApi({ version: '3.0.0' });

    if ((!config.github.user || !config.github.password) && !config.github.oauth2token) {
      throw Error('[fatal] No username/password or no Oauth2 token configured!');
    }

    if (config.github.oauth2token) {
      this.github.authenticate({
        type: 'oauth',
        token: config.github.oauth2token
      });
    } else {
      this.github.authenticate({
        type: 'basic',
        username: config.github.user,
        password: config.github.password
      });
    }
  }

  canReview (pr, callback) {
    this.getLabels(pr, labels => {
      const result = labels.filter(item => item.name === config.github.label.dontReview || item.name === config.github.label.checked);
      callback(result.length === 0);
    })
  }

  initialSetup(pr) {
    this.setReviwers(pr);
    this.selfAssignee(pr);
    this.updateLabels(pr);

    let clones = [];

    let serverLinks = `Deployment link(s): \nELNEW: ${this.getLink(config.herokuApp, pr.number)}`;
    this.doForEachClone(project => this.clonePr(pr, project, data => {
      serverLinks = `${serverLinks} \n${project}: ${data.deploy}`;
      clones.push(data.clone);
    }));

    let commentLinks = '';

    // Delay to wait for all the links be ready
    setTimeout(() => {
      if (config.github.instructionsComment !== '') {
        commentLinks = `${config.github.instructionsComment}\n ${commentLinks}`
      }

      if (clones.length > 0) {
        commentLinks += '\n\nCloned PR(s):'
        clones.forEach(clone => commentLinks += `\nhttps://github.com/${clone.owner}/${clone.repo}/pull/${clone.number}`);
      }

      this.getCommits(pr, resp => {
        const issues = [];
        resp.forEach(item => {
          const parsedCommit = this.parseCommit(item.commit.message);
          if (!parsedCommit.valid) {
            return;
          }

          if (issues.indexOf(parsedCommit.issue) === -1) {
            issues.push(parsedCommit.issue);
          }
        });

        if (config.jira.url && issues.length > 0) {
          commentLinks += `\n\nJira issue(s):`
          issues.forEach(issue => commentLinks += `\n${config.jira.url}browse/${issue}`)
        }

        this.postComment(pr.number, `${serverLinks}\n${commentLinks}`);

        this.websocket.emit('initialsetup',{
          issues,
          comment: `Github: https://github.com/${config.github.repoOwner}/${config.github.repo}/pull/${pr.number}\n${serverLinks}`,
        });

      });
    }, 5000);
  }

  setWebsocket(io) {
    this.websocket = io;
  }

  checkReviews(pr, callback) {
    this.github.pullRequests.getReviews({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
    },
    this.genericAction(
      'getReview: Error while trying to get the reviews: ',
      resp => {
        let approvalMap = {};
        let rejected = 0;
        let approved = 0;

        resp.map(item => approvalMap[item.user.login] = item.state);

        for (var key in approvalMap) {
          switch(approvalMap[key]) {
            case 'APPROVED':
              approved++;
              break;
            case 'CHANGES_REQUESTED':
              rejected++;
              break;
          }
        }

        if (rejected === 0 && approved >= config.github.reviewsNeeded) {
          this.addLabels(pr, [config.github.label.ready], callback);
          Bot.getIssues(pr, issues => this.websocket.emit('approved', { issues }));
        }
      }
    ));
  }

  getIssues(pr, callback) {
    this.getCommits(pr, resp => {
      const issues = [];
      resp.forEach(item => {
        const parsedCommit = this.parseCommit(item.commit.message);
        if (parsedCommit.valid && issues.indexOf(parsedCommit.issue) === -1) {
          issues.push(parsedCommit.issue);
        }
      });
      callback(issues);
    });

  }

  parseCommit(commitMessage) {
    const valid = config.github.firstCommitRegex.test(commitMessage);
    let issue = '';
    let project = '';
    let type = '';
    if (valid) {
      const splittedMessage = commitMessage.split(' ');
      issue = splittedMessage[0];
      project = issue.split('-')[0];
      type = splittedMessage[1].substring(0, splittedMessage[1].indexOf('('));
    }
    return {
      type,
      project,
      issue,
      valid,
    }
  }

  updateLabels(pr, callback) {
    this.getCommits(pr, resp => {
      const labels = [];
      resp.forEach(item => {
        const parsedCommit = this.parseCommit(item.commit.message);
        if (!parsedCommit.valid) {
          return;
        }

        if(labels.indexOf(parsedCommit.project) === -1) {
          labels.push(parsedCommit.project);
        }

        if(labels.indexOf(config.github.typeLabelMap[parsedCommit.type]) === -1) {
          labels.push(config.github.typeLabelMap[parsedCommit.type]);
        }
      });

      this.addLabels(pr, labels, callback);
    });
  }

  setReviwers(pr, callback) {
    const team = config.projects.filter(item => pr.title.indexOf(item) > -1)[0] || config.projects[0];
    const reviewers = config.github.reviwers.teams[team].split(' ');

    const myIndex = reviewers.indexOf(pr.user.login);
    if (myIndex > -1) {
      reviewers.splice(myIndex, 1);
    }

    this.github.pullRequests.createReviewRequest({
      number: pr.number,
      owner: config.github.repoOwner,
      repo: config.github.repo,
      reviewers,
    }, this.genericAction('createReviewRequest: Error while fetching creating reviewers', callback));
  }
  // Clone
  doForEachClone(callback) {
    config.projects.forEach(project => {
      if (!config.github.clone[project]) {
        return;
      }
      callback(project);
    });
  }
  clonePr (pr, project, callback) {
    this.github.pullRequests.create({
      title: `[clone-${pr.number}] ${pr.title}`,
      body: `Original PR: https://github.com/${config.github.repoOwner}/${config.github.repo}/pull/${pr.number}`,
      head: pr.head.label,
      base: 'master',
      owner: config.github.clone[project].owner,
      repo: config.github.clone[project].repo,
    }, (error, result) => {
      if(error) {
        return console.log('Clone PR error', error);
      }

      callback({
        deploy: this.getLink(config.github.clone[project].herokuApp, result.data.number),
        clone: {
          ...config.github.clone[project],
          number: result.data.number
        },
      });
    });
  }

  closeClone (pr, project, callback) {
    this.github.pullRequests.getAll({
      owner: config.github.clone[project].owner,
      repo: config.github.clone[project].repo,
    },
    this.genericAction(
      'getPullRequests: Error while fetching PRs ',
      clones => {
        let clone = clones.filter(clone => clone.title.indexOf(`[clone-${pr.number}]`) > -1);
        if(clone.length === 0) {
          this.postComment(pr.number, `Clone for ${project} not found`, callback);
          return;
        }

        this.github.issues.edit({
          owner: config.github.clone[project].owner,
          repo: config.github.clone[project].repo,
          number: clone[0].number,
          state: 'closed',
        }, this.genericAction('issues.edit: Error while closing a cloned pull request', callback));
      }
    ));
  }

  addLabels (pr, labels, callback) {
    this.github.issues.addLabels({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
      labels
    }, this.genericAction('addLabels: Error while trying add labels', callback));
  }

  selfAssignee(pr, callback) {
    this.github.issues.addAssigneesToIssue({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
      assignees: [pr.user.login]
    }, this.genericAction('addAssigneesToIssue: Error while assigning', callback));
  }

  postComment(number, comment, callback) {
    this.github.issues.createComment({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: number,
      body: comment
    }, this.genericAction('postComment: Error while trying to post instructions', callback));
  }

  getCommits(pr, callback) {
    this.github.pullRequests.getCommits({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
    }, this.genericAction('getCommits: Error while trying to get commits', callback));
  }

  getLabels(pr, callback) {
    this.github.issues.getIssueLabels({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number
    }, this.genericAction('getIssueLabels: Error while trying get labels', callback));
  }

  getPullRequests(callback) {
    this.github.pullRequests.getAll({
        owner: config.github.repoOwner,
        repo: config.github.repo,
      }, this.genericAction('getPullRequests: Error while fetching PRs ', callback));
  }

  getPullRequest(number, callback) {
    this.github.pullRequests.get({
        owner: config.github.repoOwner,
        repo: config.github.repo,
        number
    }, this.genericAction('get: Error while fetching PR ', callback));
  }

  genericAction(message, callback) {
    return (error, result) => {
      if (error) {
        return console.log('[error]' + message, error);
      }

      if (callback) {
        callback(result.data);
      }
    }
  }

  getLink(number, app) {
    return `https://${number}-pr-${app}.herokuapp.com/`;
  }
}

module.exports = new Bot();

