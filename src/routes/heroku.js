const express = require('express');
const router = express.Router();

let log = [];

router.post('/', function (req, res) {
  res.json({ status: 'Up and running ' });
});

module.exports = router;
