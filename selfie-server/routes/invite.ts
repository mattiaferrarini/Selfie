import {Router} from 'express';
import * as inviteController from '../controllers/inviteController';

const router = Router();

router.get('/user/:username', inviteController.getPendingInvitesByUser);
router.post('/accept/:id', inviteController.acceptInvite);
router.post('/decline/:id', inviteController.declineInvite);
router.post('/postpone/:id', inviteController.postponeInvite);

export default router;