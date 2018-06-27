const pe = process.env;

interface IConfig {
  screenshotUrl: string;
  jira: {
    auth: string;
    server: string;
  };
  socket: {
    server: string;
  };
}

export const config: IConfig = {
  screenshotUrl: 'http://ec2-18-197-175-232.eu-central-1.compute.amazonaws.com',
  jira: {
    auth: pe.JIRA_AUTH || '',
    server: pe.JIRA_SERVER || '',
  },
  socket: {
    server: pe.SOCKET_SERVER || '',
  }
};
