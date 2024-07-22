import {Router} from "express";
import notificationController from "../controllers/notificationController";

const router = Router();

router.post('/subscribe', notificationController.subscribe);
router.post('/unsubscribe', notificationController.unsubscribe);
// TODO: remove testing function
router.post('/send', notificationController.sendNotificationTest);

export default router;