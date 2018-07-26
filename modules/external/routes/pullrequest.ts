import { Router } from 'express';

import { config } from '../config'
import { git } from '../controller/Git';
import { bot } from '../controller/Bot';
import { Pullrequest } from '../controller/Pullrequest';


const router = Router();

let log = [] as any[];

router.get('/', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

router.get('/log', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

router.get('/info/:id', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

router.post('/comment', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

router.get('/deploy/:id', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Bot moved. Ping @fabio' });
});

export default router;
