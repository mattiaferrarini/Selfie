import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/info/:username', userController.getUserBasicInfo);

export default router;