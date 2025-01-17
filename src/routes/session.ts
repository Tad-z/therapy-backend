import express from 'express';
import { createSession, getAvailableSlots, getUserSessions, updateSession } from '../controller/session';

const router = express.Router();

router.post('/', createSession);
router.get('/user/:userId', getUserSessions);
router.put('/:sessionId', updateSession);
router.get('/slots', getAvailableSlots);

export default router;