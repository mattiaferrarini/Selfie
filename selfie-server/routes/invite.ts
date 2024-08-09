import {Router} from 'express';
import * as inviteController from '../controllers/inviteController';

const router = Router();

router.get('/user/:username', inviteController.getPendingInvitesByUser);
router.put('/accept/:id', inviteController.acceptInvite);
router.put('/decline/:id', inviteController.declineInvite);
router.put('/postpone/:id', inviteController.postponeInvite);

export default router;