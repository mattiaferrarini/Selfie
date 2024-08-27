import {Router} from "express";
import profileController from "../controllers/profileController";

const router = Router();

// Change password route
router.post('/change-password', profileController.changePassword);
router.post('/preferences', profileController.updatePreferences);
router.post('/change-birthday', profileController.changeBirthday);
router.post('/change-realName', profileController.changeRealName);

export default router;