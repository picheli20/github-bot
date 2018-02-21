const pe = process.env;

const projectInfos = JSON.parse(pe.PROJECTS_INFOS);

const config = {
  projects: projectInfos.projects,
  herokuApp: projectInfos.main.herokuApp,
  screenshotUrl: pe.SCREENSHOT_URL || '',
  skinName: projectInfos.main.skinName,
  jira: {
    url: pe.JIRA_URL || 'https://jira.cherrytech.com/',
  },
  github: {
    user: pe.GH_USER || '',
    password: pe.GH_PASSWORD || '',
    oauth2token:  pe.OAUTH2TOKEN || '',
    repo: projectInfos.main.repo,
    repoOwner: projectInfos.main.owner,
    clone: projectInfos.clones,
    label: {
      ready: 'ready for test',
      dontReview: 'don\'t review',
    },
    reviwers: projectInfos.reviwers,
    api: pe.GITHUB_URL || '',
    reviewsNeeded: 2,
    instructionsComment: pe.GITHUB_INTRO_COMMENT || '',
    commitRegex: /^([A-Z0-9]+)-(\d+) ([a-z]+)\b/,
    typeLabelMap: {
      'fix': 'bug',
      'chore': 'chore',
      'docs': 'docs',
      'feat': 'feature',
      'refactor': 'refactor',
      'test': 'test',
      'perf': 'perf',
    }
  },
};

module.exports = config;
