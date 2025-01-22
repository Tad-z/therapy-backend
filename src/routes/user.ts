import express from 'express';
import { addUserImage, createUser, getUsers, logIn, refreshToken } from '../controller/user';
import auth from '../Authorization/auth';

const router = express.Router();

router.post('/signup', createUser);
router.post('/login', logIn)
router.post("/add/image", auth, addUserImage);
router.post("/refresh-token", refreshToken);
router.get("/", getUsers);

export default router;