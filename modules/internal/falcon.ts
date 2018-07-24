import SocketIOClient from 'socket.io-client';
import axios from 'axios';

import { IFalconRequest } from './interfaces/falcon-request.interface';
import { time } from './utils';

export const falcon = (socket: SocketIOClient.Emitter) => {
  // { branch: pr.head.ref }
  socket.on('falcon:create', async (data: IFalconRequest) => {
    axios.post(data.url, data.payload)
      .then(resp => console.log(`${time()} - [falcon] Branch created, slug:`, data.payload.slug))
      .catch(resp => console.log(`${time()} - [falcon] Error falcon:create: slug:`, data.payload.slug ));
  });

  // { branch: pr.head.ref }
  socket.on('falcon:destroy', async (data: IFalconRequest) => {
    axios.delete(data.url)
      .then(resp => console.log(`${time()} - [falcon] ${data.payload.slug} deleted`))
      .catch(resp => console.log(`${time()} - [falcon] Error falcon:destroy: ${data.payload.slug}` ));
  });
}
