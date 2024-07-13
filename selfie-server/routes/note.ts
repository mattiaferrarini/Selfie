import { Router } from 'express';
import * as noteController from '../controllers/noteController';

const router = Router();

router.get('/', noteController.getall)
router.get('/:id', noteController.getid)
router.post('/', noteController.create)
router.put('/:id', noteController.modify)
router.delete('/:id', noteController.remove)

export default router;