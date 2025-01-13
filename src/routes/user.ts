import express from 'express';
import { createUser, logIn, refreshToken } from '../controller/user';
import auth from '../Authorization/auth';

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', logIn)
router.post("/refresh-token", refreshToken);

export default router;