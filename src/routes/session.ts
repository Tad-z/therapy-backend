import express from 'express';
import { createSession, getAvailableSlots, getSessionStatus, getUserSessions, startSession, updateSession } from '../controller/session';
import auth from '../Authorization/auth';

const router = express.Router();

router.post('/', auth, createSession);
router.get('/slots', getAvailableSlots);
router.get('/status/:sessionId', getSessionStatus);
router.get('/start', startSession);
router.get('/:sessionId', getUserSessions);
router.put('/:sessionId', updateSession);

export default router;