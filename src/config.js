const pe = process.env;

const config = {
  projects: ['CRES', 'ELNEW', 'XCAF', 'FF'],
  herokuApp: pe.HEROKU_APP || '',
  screenshotUrl: pe.SCREENSHOT_URL || '',
  skinName: 'eurolotto',
  jira: {
    url: pe.JIRA_URL || 'https://jira.cherrytech.com/',
  },
  github: {
    user: pe.GH_USER || '',
    password: pe.GH_PASSWORD || '',
    oauth2token:  pe.OAUTH2TOKEN || '',
    repo: pe.GH_REPO || '',
    repoOwner: pe.GH_REPO_OWNER || '',
    clone: {
      CRES: {
        skinName: 'cresuscasino',
        repo: pe.GH_REPO_CLONE_CRESUS || '',
        owner: pe.GH_REPO_CLONE_CRESUS_OWNER || '',
        herokuApp: pe.GH_REPO_CLONE_CRESUS_HEROKU_APP || '',
      },
      FF: {
        skinName: 'frankandfred',
        repo: pe.GH_REPO_CLONE_FF || '',
        owner: pe.GH_REPO_CLONE_FF_OWNER || '',
        herokuApp: pe.GH_REPO_CLONE_FF_HEROKU_APP || '',
      },
    },
    label: {
      ready: 'ready for test',
      dontReview: 'don\'t review',
    },
    api: pe.GITHUB_URL || '',
    reviewsNeeded: 2,
    instructionsComment: pe.GITHUB_INTRO_COMMENT || '',
    reviwers: {
      teams: {
        CRES: pe.GITHUB_REVIWERS_CRES || '',
        ELNEW: pe.GITHUB_REVIWERS_ELNEW || '',
        XCAF: pe.GITHUB_REVIWERS_XCAF || '',
      }
    },
    commitRegex: /^([A-Z0-9]+)-(\d+) ([a-z]+)\b/,
    typeLabelMap: {
      'fix': 'bug',
      'chore': 'chore',
      'docs': 'docs',
      'feat': 'feature',
      'refactor': 'refactor',
      'test': 'test',
      'perf': 'perf',
    },
    skinName: {
      ELNEW: 'eurolotto',
      CRES: 'cresuscasino',
      FF: 'frankandfred',
    }
  },
};

module.exports = config;
