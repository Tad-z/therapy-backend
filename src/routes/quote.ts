import express from 'express';
import { postQuote, getQuotes } from '../controller/quote';

const router = express.Router();

router.post('/', postQuote);
router.get('/', getQuotes);

export default router;