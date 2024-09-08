import {Router} from 'express';
import * as unavailabilityController from '../controllers/unavailabilityController';

const router = Router();

router.get('/user/:username', unavailabilityController.getUnavailabilitiesByUser);
router.put('/', unavailabilityController.addUnavailability);
router.post('/:id', unavailabilityController.modifyUnavailability);
router.delete('/:id', unavailabilityController.deleteUnavailability);

export default router;