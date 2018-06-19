import errorHandler from 'errorhandler';
import socket from 'socket.io';

import app from './app';
import { bot } from './controller/Bot';

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get("port"),
    app.get("env")
  );
  console.log('  Press CTRL-C to stop\n');
});



bot.setWebsocket(socket(server));

export default server;
