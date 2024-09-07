import {Router} from 'express';
import * as inviteController from '../controllers/inviteController';

const router = Router();

router.get('/user/:username', inviteController.getPendingInvitesByUser);
router.post('/accepted/:id', inviteController.acceptInvite);
router.post('/declined/:id', inviteController.declineInvite);
router.post('/postponed/:id', inviteController.postponeInvite);

export default router;