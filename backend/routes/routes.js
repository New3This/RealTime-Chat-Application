import express from 'express';
import { Register } from "../controller/register.js";
const router = express.Router();

router.post('/register', Register);

export default router;