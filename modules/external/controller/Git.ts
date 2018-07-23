import GitHubApi from 'github';

import { config } from '../config';
import { Pullrequest } from './Pullrequest';

class Git {
  github = new GitHubApi();

  constructor() {

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

  private getDeployedUrls(pr: Pullrequest, callback?: Function) {
    let deployedUrl: any = {};
    this.getComments(pr.number, (comments: any) => {
      let selectedComment = comments.filter((comment: any) => comment.body.indexOf('Deployment link(s):') !== -1 && comment.body.indexOf('Cloned PR(s):') !== -1)[0];
      if (!selectedComment || !selectedComment.body) {
        return;
      }

      selectedComment.body
        .split('Deployment link(s):')[1]
        .split('Cloned PR(s):')[0]
        .split('\n')
        .filter((item: string) => item.split(': ').length === 2)
        .map((item: string) => deployedUrl[item.split(': ')[0]] = item.split(': ')[1]);

      if (callback) {
        callback(deployedUrl);
      }
    });
  }


  checkReviews(pr: Pullrequest, callback?: Function) {
    this.github.pullRequests.getReviews({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
    },
    this.genericAction(
      'getReview: Error while trying to get the reviews: ',
      (resp: any) => {
        let approvalMap: any = {};
        let rejected = 0;
        let approved = 0;

        resp.map((item: any) => approvalMap[item.user.login] = item.state);

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
          // Todo: Remove this comment
          this.getDeployedUrls(pr, (deployedUrls: string) => {
            // this.getIssues(pr, (issues: any) => this.websocket.emit('approved', { issues, pr, deployedUrls}));
          });
        }
      }
    ));
  }

  getIssues(pr: Pullrequest, callback?: Function) {
    this.getCommits(pr, (resp: any) => {
      const issues: string[] = [];
      resp.forEach((item: any) => {
        const parsedCommit = this.parseCommit(item.commit.message);
        if (parsedCommit.valid && issues.indexOf(parsedCommit.issue) === -1) {
          issues.push(parsedCommit.issue);
        }
      });

      if (callback) {
        callback(issues);
      }
    });

  }

  /**
   * Extract some data from the commit message.
   *
   * @param {string} commitMessage
   * @returns {object}
   */
   parseCommit(commitMessage: string) {
    const jiraAndType = commitMessage.match(config.github.commitRegex);

    const commit = {
      issue: '',
      project: '',
      type: '',
      valid: jiraAndType !== null,
    };

    if (jiraAndType) {
      commit.issue = `${jiraAndType[1]}-${jiraAndType[2]}`;
      commit.project = jiraAndType[1];
      commit.type = jiraAndType[3];
    }

    return commit;
  }

  updateLabels(pr: Pullrequest, callback?: Function) {
    this.getCommits(pr, (resp: any) => {
      const labels: string[] = [];
      resp.forEach((item: any) => {
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

      this.addLabels(pr, labels.filter(Boolean), callback);
    });
  }

  setReviewers(pr: Pullrequest, callback?: Function) {
    const team = config.projects.filter((item: any) => pr.title.indexOf(item) > -1)[0] || config.projects[0];
    const reviewers = team.reviewers;
    const myIndex = reviewers.indexOf(pr.myself);

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

  closePr(pr: Pullrequest, callback?: Function) {
    this.github.issues.edit({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
      state: 'closed',
    }, this.genericAction('issues.edit: Error while closing a cloned pull request', callback));
  }

  addLabels (pr: Pullrequest | number, labels: string[], callback?: Function) {
    if (typeof pr !== 'number') {
      pr = pr.number;
    }

    this.github.issues.addLabels({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr,
      labels
    }, this.genericAction('addLabels: Error while trying add labels', callback));
  }

  removeLabel(pr: Pullrequest | number, label: string, callback?: Function) {
    if (typeof pr !== 'number') {
      pr = pr.number;
    }

    this.github.issues.removeLabel({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr,
      name: label
    }, this.genericAction('removeLabel: Error while trying remove labels', callback));
  }

  selfAssignee(pr: Pullrequest, callback?: Function) {
    this.github.issues.addAssigneesToIssue({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
      assignees: [pr.myself]
    }, this.genericAction('addAssigneesToIssue: Error while assigning', callback));
  }

  postComment(number: number, comment: string, callback?: Function) {
    this.github.issues.createComment({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: number,
      body: comment
    }, this.genericAction('postComment: Error while trying to post instructions', callback));
  }

  getComments(number: number, callback?: Function) {
    this.github.issues.getComments({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number,
    }, this.genericAction('postComment: Error while trying to post instructions', callback));
  }

  getCommits(pr: Pullrequest, callback?: Function) {
    this.github.pullRequests.getCommits({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr.number,
    }, this.genericAction('getCommits: Error while trying to get commits', callback));
  }

  getLabels(pr: Pullrequest | number, callback?: Function) {
    if (typeof pr !== 'number') {
      pr = pr.number;
    }

    this.github.issues.getIssueLabels({
      owner: config.github.repoOwner,
      repo: config.github.repo,
      number: pr,
    }, this.genericAction('getIssueLabels: Error while trying get labels', callback));
  }

  getPullRequests(callback?: Function) {
    this.github.pullRequests.getAll({
        owner: config.github.repoOwner,
        repo: config.github.repo,
        per_page: 10000,
      }, this.genericAction('getPullRequests: Error while fetching PRs ', callback));
  }

  getPullRequest(number: number, callback?: Function) {
    this.github.pullRequests.get({
        owner: config.github.repoOwner,
        repo: config.github.repo,
        number
    }, this.genericAction('get: Error while fetching PR ', callback));
  }

  private genericAction(message: string, callback?: Function) {
    return (error: any, result: any) => {
      if (error) {
        return console.log('[error]' + message, error);
      }

      if (callback) {
        callback(result.data);
      }
    }
  }
}

export const git = new Git();
