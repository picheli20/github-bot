import { Pullrequest } from "./Pullrequest";
import { git } from "./Git";
import { config } from "../config";
import { falcon } from "./Falcon";
import { IProject } from "../interfaces/projects";

class Bot {
  websocket: any;

  // TODO: improve the comment flow
  initialSetup(pr: Pullrequest) {
    if (pr.loginBase !== pr.login) {
      const warningMessage = `Dude... As part of transitioning XCAF to our internal infrastructure you should use \`git push upstream\` to push in \`xcaliber-private\` instead of pushing in \`${pr.myself}\``;
      git.postComment(pr.number, warningMessage, () => git.closePr(pr));
      return;
    }

    git.setReviewers(pr);
    git.selfAssignee(pr);
    git.updateLabels(pr);

    let deployedUrl = {};

    let serverLinks = 'Deployment link(s):\n';

    const faconDeploy = this.deployAll(pr);
    const deployments = faconDeploy.map((item: any) => serverLinks += `${item.skin}: ${item.link}\n`);
    const regression = `\nRegression Page: \n ${config.screenshotUrl}${pr.branch}`;

    let commentLinks = '';
    if (config.github.instructionsComment !== '') {
      commentLinks = `${config.github.instructionsComment}\n ${commentLinks}`
    }

    git.getCommits(pr, (resp: any) => {
      const issues: any[] = [];
      resp.forEach((item: any) => {
        const parsedCommit = git.parseCommit(item.commit.message);
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

      const comment = `${serverLinks}\n${commentLinks}\n${regression}`

      git.postComment(pr.number, `${comment}`);
      this.websocket.emit('initialsetup',{
        issues,
        pr,
        deployedUrl,
        comment: `Github: https://github.com/${config.github.repoOwner}/${config.github.repo}/pull/${pr.number}\n${comment}`,
      });
    });
  }

  deployAll(pr: Pullrequest) {
    return config.projects.map((project: IProject) => {
      const resp = falcon.deploy(pr, project);
      this.websocket.emit('falcon:create', { url: resp.url, payload: resp.payload });
      return resp;
    });
  }

  setWebsocket(io: SocketIO.Server) {
    this.websocket = io;
    this.websocket.on('connection', (socket: any) => {
      socket.on(
        'e2e:fail',
        ({ pr }: any) => {
          git.postComment(pr.number, `E2E tests failed, [click here](http://xcaliber-bot.herokuapp.com/e2e/${pr.number}) to re-run.`);
          git.addLabels(pr, ['e2e:fail']);
        },
      );
      socket.on('e2e:success', ({ pr }: any) => {
        git.removeLabel(pr, 'e2e:fail');
        git.addLabels(pr, ['e2e:success']);
      });
    });
  }
}

export const bot = new Bot();
