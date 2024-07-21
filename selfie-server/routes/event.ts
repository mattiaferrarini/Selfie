import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

router.get('/user/:userId', eventController.getEventsByUser);
router.delete('/:id', eventController.deleteEvent);
router.post('/', eventController.addEvent);
router.put('/:id', eventController.modifyEvent);

export default router;