import { Router } from 'express';

import { config } from '../config'
import { git } from '../controller/Git';
import { bot } from '../controller/Bot';
import { Pullrequest } from '../controller/Pullrequest';


const router = Router();

let log = [] as any[];

router.get('/', (req, res) => {
  res.json({ status: 'I should be a PR' });
});

router.post('/', (req, res) => {

  if (!req.body || !req.body.action) {
    res.json({ error: 'POST Request received, but no body!' });
    return console.error('POST Request received, but no body!');
  }

  log.unshift(req.body);

  if (log.length > 50) {
    log.pop();
  }

  let pr: Pullrequest;

  switch (req.body.action) {
    case 'opened':
      pr = new Pullrequest(req.body);
      res.json({ status: 'Checking openned' });
      git.addLabels(pr, [config.status.pending.tag]);
      bot.initialSetup(pr);
      break;
    case 'submitted':
      pr = new Pullrequest(req.body);
      res.json({ status: 'Checking review' });
      git.checkReviews(pr);
      break;
    case 'closed':
      pr = new Pullrequest(req.body);
      res.json({ status: 'Closing' });

      if (pr.isMerged()) {
        git.getIssues(pr, (issues: string[]) => bot.handleMerged(issues));
      }

      bot.purgeScreenshots(pr.branch);
      bot.destroyAll(pr);

      break;
    // new comment
    case 'created':
      res.json({ status: 'Checking comment' });
      const comment = req.body.comment;

      if (!comment || comment.user.login !== config.github.user || comment.body.startsWith('Deployment')) {
        return;
      }
      const prNumber = req.body.issue ? req.body.issue.number : req.body.pull_request.number;

      bot.resetAndAddTags(prNumber, config.status[comment.body.startsWith(':white_check_mark:') ? 'success' : 'fail'].tag);
      break;
    // new commit pushed
    case 'synchronize':
      res.json({ status: 'Synchronizing' });
      bot.resetAndAddTags(req.body.number, config.status.pending.tag);
      break;
    default:
      res.json({ status: 'Default, no action' });
      break;
  }
});

router.get('/log', (req, res) => {
  res.json({ log });
});

router.get('/info/:id', (req, res) => {
  git.getPullRequest(req.params.id, (json: any) => {
    const pr = new Pullrequest(json);
    res.json({ json, test: pr.login });
  });
});

router.post('/comment', (req, res) => {
  const message = req.body.message;
  const id = req.body.id;

  if (isNaN(id)) {
    git.getPullRequests((prs: any) => {
      let prArr = prs.filter((pr: any) => pr.head.ref === id);

      if (prArr.length > 0) {
        const pr = new Pullrequest(prArr[0]);
        git.postComment(pr.number, `${message}`, () => res.json({ success: true }));
      } else {
        res.json({ success: false, message: 'Branch not found' });
      }
    });
  } else {
    git.postComment(id, `${message}`, () => res.json({ success: true }));
  }
});

router.get('/deploy/:id', (req, res) => {
  git.getPullRequest(req.params.id, (json: any) => {
    const pr = new Pullrequest(json);
    const deployments = bot.deployAll(pr);
    let comment = 'Deployment link(s):\n';

    deployments.map((item: any) => comment += `${item.skin}: ${item.link}\n`);

    git.postComment(pr.number, `${comment}`);

    res.json({
      status: `Deploying`,
      branches: config.projects,
      deployments
    });
  });
});

router.get('/:id', (req, res) => {
  git.getPullRequest(req.params.id, (json: any) => {
    const pr = new Pullrequest(json);
    res.json({ status: 'Doing initial setup on ' + pr.title });
    bot.initialSetup(pr);
  });
});

export default router;
