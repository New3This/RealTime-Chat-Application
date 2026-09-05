import express from 'express';
import { Register, Login, Logout } from "../controller/controller.js";
import upload from "../controller/controller.js";

const router = express.Router();

router.post('/register', upload.single('file'), Register);

router.post('/login', Login);

router.post('/logout', Logout);

export default router;