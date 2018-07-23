import socket from 'socket.io';
import express from 'express';
import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';

import index from './routes';
import { bot } from './controller/Bot';

const port = process.env.PORT || '3000';
const app = express();

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', index);

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(port, () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    port,
    app.get("env")
  );
  console.log('  Press CTRL-C to stop\n');
});

bot.setWebsocket(socket(server));

