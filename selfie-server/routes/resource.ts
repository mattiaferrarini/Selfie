import { Router } from "express";
import * as resourceController from "../controllers/resourceController";

const router = Router();


router.get("/all", resourceController.getAllResources);
router.get("/:username", resourceController.getResource);
router.post("/", resourceController.addResource);
router.delete("/:id", resourceController.deleteResource);

export default router;