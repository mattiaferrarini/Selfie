import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

// get all users' username
router.get('/usernames', userController.getUserNames);

export default router;
