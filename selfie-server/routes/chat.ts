import {Router} from "express";
import chatController from "../controllers/chatController";

const router = Router();

router.get('/list', chatController.listMessages);

export default router;