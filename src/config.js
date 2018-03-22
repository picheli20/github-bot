const pe = process.env;

const projectInfos = JSON.parse(pe.PROJECTS_INFOS);
const config = {
  falconUrl: projectInfos.falconUrl,
  projects: projectInfos.projects,
  projectsInfo: projectInfos.projectsInfo,
  screenshotUrl: pe.SCREENSHOT_URL || '',
  jira: {
    url: pe.JIRA_URL || 'https://jira.cherrytech.com/',
  },
  github: {
    user: pe.GH_USER || '',
    password: pe.GH_PASSWORD || '',
    oauth2token:  pe.OAUTH2TOKEN || '',
    repo: 'xc-r2d2',
    repoOwner: 'xcaliber-private',
    label: {
      ready: 'ready for test',
      dontReview: 'don\'t review',
    },
    reviewers: projectInfos.reviewers,
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
