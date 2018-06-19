import express from 'express';
import bodyParser from 'body-parser';

import index from './routes/index';

const port = process.env.PORT || '3000';
const app = express();

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', index);

export default app;
