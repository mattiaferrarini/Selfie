import { Router } from 'express';
import * as timeMachineController from '../controllers/timeMachineController';

const router = Router();

router.get('/', timeMachineController.getTime);
router.post('/setGlobalClock', timeMachineController.setGlobalClock);
router.post('/restoreGlobalClock', timeMachineController.restoreGlobalClock);

export default router;