const pe = process.env;

const config = {
  projects: ['CRES', 'ELNEW', 'XCAF', 'FF', 'VC', 'SM'],
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
      VC: {
        skinName: 'vegascasino',
        repo: pe.GH_REPO_CLONE_VC || '',
        owner: pe.GH_REPO_CLONE_VC_OWNER || '',
        herokuApp: pe.GH_REPO_CLONE_VC_HEROKU_APP || '',
      },
      SM: {
        skinName: 'sunmaker',
        repo: pe.GH_REPO_CLONE_SM || '',
        owner: pe.GH_REPO_CLONE_SM_OWNER || '',
        herokuApp: pe.GH_REPO_CLONE_SM_HEROKU_APP || '',
      },
    },
    label: {
      ready: 'ready for test',
      dontReview: 'don\'t review',
    },
    reviwers: {
      teams: {
        CRES: pe.GITHUB_REVIWERS_CRES || '',
        XCAF: pe.GITHUB_REVIWERS_XCAF || '',
        ELNEW: pe.GITHUB_REVIWERS_ELNEW || '',
        FF: pe.GITHUB_REVIWERS_FF || '',
        VC: pe.GITHUB_REVIWERS_VC || '',
        SM: pe.GITHUB_REVIWERS_SM || '',
      }
    },
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
