import {Router} from "express";
import profileController from "../controllers/profileController";

const router = Router();

// Change password route
router.post('/change-password', profileController.changePassword);
router.post('/change-birthday', profileController.changeBirthday);
router.post('/change-real_name', profileController.changeRealName);
router.post('/preferences/pomodoro', profileController.updatePomodoroPreferences);

export default router;