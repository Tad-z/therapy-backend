import express from 'express';
import multer from 'multer';
import { addUserImage, createUser, getUsers, logIn, refreshToken } from '../controller/user';
import auth from '../Authorization/auth';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

router.post('/signup', createUser);
router.post('/login', logIn)
router.put('/image', auth, upload.single('file'), addUserImage);
router.post("/refresh-token", refreshToken);
router.get("/", getUsers);

export default router;