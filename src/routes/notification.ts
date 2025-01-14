import express from 'express';
import { broadcast, getNotificationsPerUser } from '../controller/notification';

const router = express.Router();

router.post('/broadcast', broadcast);
router.get('/user/:userId', getNotificationsPerUser);

export default router;