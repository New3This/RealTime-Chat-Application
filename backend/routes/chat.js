import authenticate from "../middleware/authenticate.js";
import { UserInfo, Userbase, ChatMessage, ReturnChat, DeleteChat, EditChat, EmojiReaction} from "../controller/controller.js";
import express from 'express';

const router = express.Router();

router.use(authenticate);

router.get('/user', UserInfo);

router.get('/userbase', Userbase);

router.post('/message/:receiverId', ChatMessage);

router.get('/message/receive/:receiverId', ReturnChat);

router.delete('/removeMsg/:msgId', DeleteChat);

router.patch('/editMsg/:msgId', EditChat);

router.patch('/msg/:msgId', EmojiReaction);

export default router;