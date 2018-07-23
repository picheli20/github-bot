import SocketIO from 'socket.io-client';

import { time } from './utils';
import { jira } from './jira';
import { falcon } from './falcon';
import { screenshot } from './screenshot';
import { config } from './config';


// STATUS.
const server = config.socket.server || 'http://localhost:3000';
const socket = SocketIO(server);

socket.on('connect', () => console.log(`${time()} - [log] Connected on ${server}`));
socket.on('disconnect', () => console.log(`${time()} - [log] Disconnect from the server`));

jira(socket);
falcon(socket);
screenshot(socket);

console.log(`Trying to connect on ${server}`);
