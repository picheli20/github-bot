const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const pullrequest = require('./src/routes/pullrequest');
const e2e = require('./src/routes/e2e');
const Bot = require('./src/bot');

const port = process.env.PORT || '3000';

const app = express();

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/pullrequest', pullrequest);
app.use('/e2e', e2e);

const server = http.createServer(app);


Bot.setWebsocket(require('socket.io')(server));

server.listen(port);
server.on('listening', () => console.log('Listening on ' + port));
