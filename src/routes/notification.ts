import express from 'express';
import { broadcast } from '../controller/notification';

const router = express.Router();

router.post('/broadcast', broadcast);

export default router;