import express from 'express';
import { createSession, getAvailableSlots, getSessionStatus, getUserSessions, startSession, updateSession } from '../controller/session';
import auth from '../Authorization/auth';

const router = express.Router();

router.post('/', auth, createSession);
router.post('/start', auth, startSession);
router.get('/slots', getAvailableSlots);
router.get('/status/:sessionId', auth, getSessionStatus);
router.get('/:userId', getUserSessions);
router.put('/:sessionId', updateSession);

export default router;
