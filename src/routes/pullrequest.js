const express = require('express');
const router = express.Router();
const Bot = require('../bot');
const config = require('../config');

let log = [];

/**
* POST /pullrequest: Process incoming GitHub payload
*/
router.post('/', function (req, res) {
  res.json({ status: 'Checking ' });

  if (!req.body) {
    return console.error('POST Request received, but no body!');
  }

  const pr = req.body.pull_request;
  log.unshift({ action: req.body.action, pr});
  if(log.length > 50) {
    log.pop();
  }

  switch (req.body.action) {
    case 'opened':
      Bot.initialSetup(pr);
      break;
    case 'submitted':
      Bot.checkReviews(pr);
      break;
    case 'closed':
      Bot.doForEachClone(project => Bot.closeClone(pr, project));
      break;
  }
});

/**
* GET /pullrequest: Process all pull requests
*/
router.get('/all', function (req, res) {
  Bot.getPullRequests(res => {
    res.json({ status: 'Doing initialSetup on ' + res.length + ' PRS' });
    res.forEach(pr => Bot.initialSetup(pr));
  });
});

router.get('/log', function (req, res) {
  res.json(log);
});

/**
* GET /pullrequest: Process all pull requests
*/
router.get('/close/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, pr => {
    res.json({ status: 'Doing initial setup on ' + pr.title });
    Bot.closeClone(pr, 'CRES');
  });
});


/**
* GET /pullrequest: Process all pull requests
*/
router.get('/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, pr => {
    res.json({ status: 'Doing initial setup on ' + pr.title });
    Bot.initialSetup(pr);
  });
});

module.exports = router;
