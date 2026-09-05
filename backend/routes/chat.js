import authenticate from "../middleware/authenticate.js";
import { UserInfo, Userbase } from "../controller/controller.js";
import express from 'express';

const router = express.Router();

router.use(authenticate);

router.get('/user', UserInfo);

router.get('/userbase', Userbase);

export default router;