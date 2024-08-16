import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/user/:username', eventController.getEventsByUser);
router.get('/:id', eventController.getEventById);
router.put('/', eventController.addEvent);
router.post('/overlap/:username', eventController.getOverlappingEvents);
router.post('/import', eventController.importICalendar);
router.post('/export', upload.single('file'), eventController.sendExportViaEmail);
router.post('/:id', eventController.modifyEvent);
router.delete('/:id', eventController.deleteEvent);

export default router;