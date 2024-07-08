import {Router} from "express";
import * as profileController from "../controllers/profileController";

const router = Router();

// Change password route
router.post('/change-password', profileController.changePassword);

export default router;