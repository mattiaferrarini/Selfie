import {Router} from "express";
import profileController from "../controllers/profileController";

const router = Router();

// Change password route
router.post('/change-password', profileController.changePassword);
router.post('/preferences/home', profileController.updateHomePreferences);
router.post('/change-birthday', profileController.changeBirthday);
router.post('/change-realName', profileController.changeRealName);
router.post('/preferences/notification', profileController.updateNotificationPreferences);
router.post('/preferences/pomodoro', profileController.updatePomodoroPreferences);

export default router;