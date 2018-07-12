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
  screenshotUrl: 'http://api.xc-regression.aasanchez.host/',
  jira: {
    auth: pe.JIRA_AUTH || '',
    server: pe.JIRA_SERVER || '',
  },
  socket: {
    server: pe.SOCKET_SERVER || '',
  }
};
