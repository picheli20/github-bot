const pe = process.env;
let githubInfos: any = {};

if (pe.PROJECTS_INFOS) {
  const { github } = JSON.parse(pe.PROJECTS_INFOS as string);
  githubInfos = github;
}

export const github: any = {
  user: pe.GH_USER || '',
  password: pe.GH_PASSWORD || '',
  oauth2token:  pe.OAUTH2TOKEN || '',
  repo: 'xc-r2d2',
  repoOwner: 'xcaliber-private',
  label: {
    ready: 'ready for test',
    dontReview: 'don\'t review',
  },
  api: pe.GITHUB_URL || '',
  reviewsNeeded: 2,
  instructionsComment: githubInfos.instructionsComment || '',
  commitRegex: /^([A-Z0-9]+)-(\d+) ([a-z]+)\b/,
  typeLabelMap: {
    'fix': 'bug',
    'chore': 'chore',
    'docs': 'docs',
    'feat': 'feature',
    'refactor': 'refactor',
    'test': 'test',
    'perf': 'perf',
    'ci': 'ci',
  }
};
