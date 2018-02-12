const express = require('express');
const router = express.Router();
const Bot = require('../bot');
const config = require('../config');
const axios = require("axios");

let log = [];

router.post('/', function (req, res) {

  if (!req.body) {
    return console.error('POST Request received, but no body!');
  }

  const pr = req.body.pull_request;
  log.unshift({ action: req.body.action, pr});
  if(log.length > 50) {
    log.pop();
  }

  if (req.body.deployment_status && req.body.deployment_status.state === 'success') {
    const domain = req.body.deployment.payload.web_url; // example: https://eurolotto-staging-pr-664.herokuapp.com/
    const environment = req.body.deployment.environment; //  example: eurolotto-staging-pr-811
    const [app, prNumber] = environment.split('pr-');
    let skin = config.skinName;

    const result = config.projects.filter(item => config.github.clone[item] && config.github.clone[item].herokuApp === app);
    if (result.length === 1) {
      skin = config.github.clone[result[0]].skinName;
    }

    Bot.getPullRequest(prNumber, pr => {
      const branch = pr.head.ref;
      axios.post(`${config.screenshotUrl}/screenshot`, { branch, skin, domain })
        .then(status => res.json({ status: 'Checking...', status }))
        .catch(error => res.json({ status: 'Error', error }));
    });
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
        Bot.doForEachClone(project => Bot.closeClone(pr, project));
        if (pr.merged_at) Bot.getIssues(pr, issues => Bot.websocket.emit('merged', { issues }));
        axios.post(`${config.screenshotUrl}/purge`, { branch: pr.head.ref })
          .then(status => res.json({ status: 'Checking closed...', status }))
          .catch(error => res.json({ status: 'Error closed', error }));

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

module.exports = router;
