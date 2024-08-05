import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/user/:username', eventController.getEventsByUser);
router.post('/', eventController.addEvent);
router.post('/import', eventController.importICalendar);
router.put('/:id', eventController.modifyEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/export', upload.single('file'), eventController.sendExportViaEmail);

export default router;