import express from 'express';
import { createSession, getAvailableSlots } from '../controller/session';

const router = express.Router();

router.post('/', createSession);
router.get('/slots', getAvailableSlots);

export default router;