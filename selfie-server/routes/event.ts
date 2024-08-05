import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

router.get('/user/:username', eventController.getEventsByUser);
router.post('/', eventController.addEvent);
router.put('/import', eventController.importICalendar);
router.put('/:id', eventController.modifyEvent);
router.delete('/:id', eventController.deleteEvent);

export default router;