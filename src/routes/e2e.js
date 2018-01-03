const express = require('express');
const router = express.Router();
const Bot = require('../bot');
const config = require('../config');

let log = [];

router.get('/:id', function (req, res) {
  Bot.getPullRequest(req.params.id, pr => {
    res.json({ status: 'Running tests on ' + pr.title });
    Bot.runTests(pr);
  });
});

module.exports = router;
