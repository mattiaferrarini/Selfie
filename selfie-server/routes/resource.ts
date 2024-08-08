import { Router } from "express";
import * as resourceController from "../controllers/resourceController";

const router = Router();

router.get("/all", resourceController.getAllResources);
router.post("/", resourceController.addResource);
router.delete("/:id", resourceController.deleteResource);

export default router;