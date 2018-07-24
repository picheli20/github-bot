import SocketIOClient from 'socket.io-client';
import axios from 'axios';

import { IFalconRequest } from './interfaces/falcon-request.interface';
import { config } from './config';
import { time } from './utils';

export const screenshot = (socket: SocketIOClient.Emitter) => {
  // { branch: pr.head.ref }
  socket.on('screenshot:purge', async (data: IFalconRequest) => {
    console.log(`${time()} - [screenshot] purging ${data.branch}`);
    axios.post(`${config.screenshotUrl}/purge`, data)
      .then(resp => console.log(`${time()} - [screenshot] screenshot:create\n`, resp.data))
      .catch(resp => console.log(`${time()} - [screenshot] Error screenshot:purge\n`, resp.data, `\t\t request:\n`, data ));
  });

  // { branch: pr.head.ref, skin, domain }
  socket.on('screenshot:create', async (data: IFalconRequest) => {
    console.log(`${time()} - [screenshot]  ${data.skin} - ${data.branch} (${data.domain})`);
    axios.post(`${config.screenshotUrl}/screenshot`, data)
      .then(resp => console.log(`${time()} - [screenshot] screenshot:create\n`, resp.data))
      .catch(resp => console.log(`${time()} - [screenshot] Error screenshot:create\n`, resp.data, `\t\t request:\n`, data ));
  });
}
