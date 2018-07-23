import atob from 'atob';
import { config } from './config';
import { time } from './utils';
import { STATUS } from './config/status';

// https://github.com/jira-node/node-jira-client/pull/194
const JiraApi = require('jira-client');

const [username, password] = atob(config.jira.auth).split(':')

const jiraApi = new JiraApi({
  protocol: 'https',
  host: config.jira.server,
  apiVersion: '2',
  strictSSL: true,
  username,
  password
});

export const jira = (socket: SocketIOClient.Emitter) => {

  socket.on('initialsetup', async ({ issues, comment }: { issues: string[], comment: string }) => {
    issues.map(async (issue) => {
      console.log(`${time()} - [${issue}] initial setup`);
      jiraApi.addComment(issue, comment);


      const issueObj: any = await jiraApi.findIssue(issue);

      if (issueObj.fields.status.name.toLocaleLowerCase() !== 'in progress'){
        return;
      }

      // Replace ISSUE_ID
      // https://jira.xcaliber.io/rest/api/2/issue/<ISSUE_ID>/transitions?expand=transitions.fields
      jiraApi.transitionIssue(issue, {
        transition: { id: STATUS.review }
      });

    });
  });

  socket.on('approved', async ({ issues }: { issues: string[] }) => {
    issues.map(async issue => {
      console.log(`${time()} - [${issue}] approved`);

      const issueObj: any = await jiraApi.findIssue(issue);
      if (issueObj.fields.status.name.toLocaleLowerCase() !== 'in review'){
        return;
      }

      jiraApi.transitionIssue(issue, {
        transition: { id: STATUS.approved }
      });
    });
  });

  socket.on('merged', async ({ issues }: { issues: string[] }) => {
    await issues.map(async issue => {
      console.log(`${time()} - [${issue}] merged`);
      const issueObj = await jiraApi.findIssue(issue);
      if (issueObj.fields.status.name.toLocaleLowerCase() !== 'tested') {
        return;
      }

      jiraApi.transitionIssue(issue, { transition: { id: STATUS.merged } });
    });
  });
}
