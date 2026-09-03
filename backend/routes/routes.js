import express from 'express';
import { Register, Login, Logout, UserInfo } from "../controller/controller.js";
import upload from "../controller/controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post('/register', upload.single('file'), Register);

router.post('/login', Login);

router.post('/logout', Logout);

router.get('/user', authenticate, UserInfo);

export default router;