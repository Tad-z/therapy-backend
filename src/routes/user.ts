import express from 'express';
import { createUser, logIn } from '../controller/user';
import auth from '../Authorization/auth';

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', logIn)