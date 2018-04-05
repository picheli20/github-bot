const express = require('express');
const router = express.Router();
const Bot = require('../bot');
const config = require('../config');

let log = [];

function callSRT(branch, skin, domain, res) {
  res.json({ status: 'Calling screenshot:create ', data: { branch, skin, domain } });
  Bot.websocket.emit('screenshot:create', { branch, skin, domain });
}

router.post('/', function (req, res) {

  if (!req.body) {
    res.json({ error: 'POST Request received, but no body!' });
    return console.error('POST Request received, but no body!');
  }

  const pr = req.body.pull_request;
  log.unshift(pr);
  if(log.length > 50) {
    log.pop();
  }

  if (req.body.deployment_status && req.body.deployment_status.state === 'success') {
    const domain = req.body.deployment.payload.web_url; // example: "web_url": "https://xcaliber-ci-pr-179.herokuapp.com/"
    const environment = req.body.deployment.environment; //  example: "environment": "xcaliber-ci-pr-179",
    const [app, prNumber] = environment.split('-pr-');
    let skin = config.skinName;

    const result = config.projects.filter(item => config.github.clone[item] && config.github.clone[item].herokuApp === app);

    if (result.length === 1) {
      skin = config.github.clone[result[0]].skinName;
    }

    if (!prNumber) {
      res.json({ status: 'PR number cannot be undefined' });
      return;
    }

    if (req.body.repository.fork) {
      Bot.getOtherPR({
        owner: req.body.repository.owner.login,
        number: prNumber
      }, clonePR => {
        Bot.getPullRequest(
          clonePR.title.split(`[clone-`)[1].split(`]`)[0],
          pr => callSRT(pr.head.ref, skin, domain, res)
        );
      })
    } else {
      Bot.getPullRequest(prNumber, pr => callSRT(pr.head.ref, skin, domain, res));
    }
  } else {
    switch (req.body.action) {
      case 'opened':
        res.json({ status: 'Checking openned' });
        Bot.initialSetup(pr);
        break;
      case 'submitted':
        res.json({ status: 'Checking review' });
        Bot.checkReviews(pr);
        break;
      case 'closed':
        res.json({ status: 'Closing' });
        if (pr.merged_at) Bot.getIssues(pr, issues => Bot.websocket.emit('merged', { issues }));
        Bot.websocket.emit('screenshot:purge', { branch: pr.head.ref });
        break;
      default:
        res.json({ status: 'Default, no action' });
        break;
    }
  }
});

router.get('/all', function (req, res) {
  Bot.getPullRequests(res => {
    res.json({ status: 'Doing initialSetup on ' + res.length + ' PRS' });
    res.forEach(pr => Bot.initialSetup(pr));
  });
});

router.get('/log', function (req, res) {
  res.json(log);
});

router.get('/close/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, pr => {
    res.json({ status: 'Doing initial setup on ' + pr.title });
    Bot.closeClone(pr, 'CRES');
  });
});

router.get('/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, pr => {
    res.json({ status: 'Doing initial setup on ' + pr.title });
    Bot.initialSetup(pr);
  });
});

router.get('/info/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, pr => res.json(pr));
});

router.get('/deploy/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, (pr) => {
    const deployments = config.projects.map((skin) => Bot.falconDeploy(pr, config.projectsInfo[skin]));
    let comment = 'Deployment link(s):\n';

    deployments.map(item => comment += `${item.skin}: ${item.link}\n`);

    Bot.postComment(pr.number, `${comment}`);

    res.json({
      status: `Deploying ${pr.head.ref}`,
      branches: config.projects,
      deployments
    });
  });
});

module.exports = router;
