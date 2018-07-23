import express from 'express';
import pullrequest from './pullrequest';


const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'Up and running ' });
});

router.use('/pullrequest', pullrequest);

export default router;
