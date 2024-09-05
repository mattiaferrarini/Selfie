import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController';

const router = Router();

router.put('/register', authController.register, authController.login);
router.post('/login', passport.authenticate('local'), authController.login);
router.post('/logout', authController.logout);

export default router;
