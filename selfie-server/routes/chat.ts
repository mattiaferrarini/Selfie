import {Router} from "express";
import chatController from "../controllers/chatController";

const router = Router();

// Change password route
//router.get('/list:username', chatController.listMessagesByUser);
router.get('/list', chatController.listMessages);

export default router;