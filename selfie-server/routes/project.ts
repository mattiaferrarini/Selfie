import { Router } from 'express';
import * as projectController from '../controllers/projectController';

const router = Router();

router.get("/all", projectController.getAllProjects);
router.put('/', projectController.addProject);
router.post('/:id', projectController.modifyProject);
router.post('/:id/status', projectController.modifyStatus);
router.post('/:id/leave', projectController.leaveProject);
router.delete('/:id', projectController.deleteProject);

export default router;