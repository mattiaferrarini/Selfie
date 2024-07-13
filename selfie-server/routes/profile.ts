import {Router} from "express";
import profileController from "../controllers/profileController";

const router = Router();

// Change password route
router.post('/change-password', profileController.changePassword);
router.post('/preferences/pomodoro', profileController.updatePomodoroPreferences);

export default router;