import { Router } from 'express';
import * as projectController from '../controllers/projectController';

const router = Router();

router.put('/', projectController.addProject);

export default router;