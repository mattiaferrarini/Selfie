import { Router } from 'express';
import * as activityController from '../controllers/activityController';

const router = Router();

router.get('/user/:username', activityController.getActivitiesByUser);
router.get('/pomodoro/stats', activityController.getPomodoroStats);
router.get('/:id', activityController.getActivityById);
router.post('/', activityController.addActivity);
router.put('/:id', activityController.modifyActivity);
router.delete('/:id', activityController.deleteActivity);

export default router;