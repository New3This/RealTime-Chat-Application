import express from 'express';
import { Register, Login, Logout } from "../controller/controller.js";
import {upload, handleUpload} from "../middleware/upload.js";

const router = express.Router();

router.post('/register', handleUpload, Register);

router.post('/login', Login);

router.post('/logout', Logout);

export default router;