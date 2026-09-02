import express from 'express';
import { Register, Login } from "../controller/controller.js";
import upload from "../controller/controller.js";

const router = express.Router();

router.post('/register', upload.single('file'), Register);

router.post('/login', Login);

export default router;