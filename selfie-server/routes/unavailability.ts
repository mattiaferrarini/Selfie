import {Router} from 'express';
import * as unavailabilityController from '../controllers/unavailabilityController';

const router = Router();

router.get('/user/:username', unavailabilityController.getUnavailabilitiesByUser);
router.post('/', unavailabilityController.addUnavailability);
router.put('/:id', unavailabilityController.modifyUnavailability);
router.delete('/:id', unavailabilityController.deleteUnavailability);

export default router;