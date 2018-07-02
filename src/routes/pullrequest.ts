import { Router } from 'express';

import { config } from '../config'
import { git } from '../controller/Git';
import { bot } from '../controller/Bot';
import { falcon } from '../controller/Falcon';
import { Pullrequest } from '../controller/Pullrequest';
import { IProject } from '../interfaces/projects';

const router = Router();

let log = [] as any[];

router.get('/', (req, res) => {
  res.json({ status: 'I should be a PR' });
});

router.post('/', (req, res) => {

  if (!req.body || !req.body.pull_request) {
    res.json({ error: 'POST Request received, but no body!' });
    return console.error('POST Request received, but no body!');
  }

  const pr = new Pullrequest(req.body);

  log.unshift(req.body.pull_request);

  if(log.length > 50) {
    log.pop();
  }

  switch (req.body.action) {
    case 'opened':
      res.json({ status: 'Checking openned' });
      bot.initialSetup(pr);
      break;
    case 'submitted':
      res.json({ status: 'Checking review' });
      git.checkReviews(pr);
      break;
    case 'closed':
      res.json({ status: 'Closing' });

      if (pr.isMerged()) git.getIssues(pr, (issues: string[]) => bot.websocket.emit('merged', { issues }));
      bot.websocket.emit('screenshot:purge', { branch: pr.branch });
      // Loop through each skin and tell Falcon to destroy the environment
      config.projects.forEach((project: IProject) =>
        bot.websocket.emit(
          'falcon:destroy',
          falcon.destroy(pr, project),
        ),
      );
      break;
    default:
      res.json({ status: 'Default, no action' });
      break;
  }
});

router.get('/log', (req, res) => {
  res.json({ log });
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

router.get('/:id', (req, res) => {
  git.getPullRequest(req.params.id, (json: any) => {
    const pr = new Pullrequest(json);
    res.json({ status: 'Doing initial setup on ' + pr.title });
    bot.initialSetup(pr);
  });
});

export default router;
