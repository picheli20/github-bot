const pe = process.env;
let jiraConfig: IJiraConfig = {};

if (pe.PROJECTS_INFOS) {
  const { jira } = JSON.parse(pe.PROJECTS_INFOS as string)
  jiraConfig = jira;
}

interface IJiraConfig {
  url?: string;
}

export const jira = {
  ...jiraConfig,
};
