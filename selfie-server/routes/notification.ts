import {Router} from "express";
import notificationController from "../controllers/notificationController";

const router = Router();

router.post('/subscribe', notificationController.subscribe);
router.post('/unsubscribe', notificationController.unsubscribe);

export default router;