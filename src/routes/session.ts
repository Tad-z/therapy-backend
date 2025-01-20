import express from 'express';
import { createSession, getAvailableSlots, getSessionStatus, getUserSessions, updateSession } from '../controller/session';
import auth from '../Authorization/auth';

const router = express.Router();

router.post('/', auth, createSession);
router.get('/status/:sessionId', getSessionStatus);
router.get('/:sessionId', updateSession);
router.put('/:sessionId', updateSession);
router.get('/slots', getAvailableSlots);

export default router;