const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const pullrequest = require('./src/routes/pullrequest');
const port = process.env.PORT || '3000';

const app = express();

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/pullrequest', pullrequest);

const server = http.createServer(app);
server.listen(port);
server.on('listening', () => console.log('Listening on ' + port));
