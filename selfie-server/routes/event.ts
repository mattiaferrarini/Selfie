import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/user/:username', eventController.getEventsByUser);
router.get('/:id', eventController.getEventById);
router.put('/', eventController.addEvent);
router.post('/import', eventController.importICalendar);
router.post('/export', upload.single('file'), eventController.sendExportViaEmail);
router.post('/:id', eventController.modifyEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/removeParticipant/:id', eventController.removeParticipant);

export default router;