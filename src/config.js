const pe = process.env;

const config = {
  projects: ['CRES', 'ELNEW'],
  herokuApp: pe.HEROKU_APP || '',
  github: {
    user: pe.GH_USER || '',
    password: pe.GH_PASSWORD || '',
    oauth2token:  pe.OAUTH2TOKEN || '',
    repo: pe.GH_REPO || '',
    repoOwner: pe.GH_REPO_OWNER || '',
    clone: {
      CRES: {
        repo: pe.GH_REPO_CLONE_CRESUS || '',
        owner: pe.GH_REPO_CLONE_CRESUS_OWNER || '',
        herokuApp: pe.GH_REPO_CLONE_CRESUS_HEROKU_APP || '',
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
      }
    },
    firstCommitRegex: /(?:[A-Z0-9]+-\d+ (?:feat|fix|perf|revert|docs|style|refactor|test|chore)\([^ )]*\): .+|Release \d+\.\d+\.\d+)/,
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
