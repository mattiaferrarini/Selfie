import { Router } from 'express';
import * as projectController from '../controllers/projectController';

const router = Router();

router.get("/all", projectController.getAllProjects);
router.put('/', projectController.addProject);
router.post('/:id', projectController.modifyProject);
router.delete('/:id', projectController.deleteProject);

export default router;