import {Router} from "express";
import * as resourceController from "../controllers/resourceController";
import {isAdmin} from "../middlewares/authMiddleware";

const router = Router();

router.get("/all", resourceController.getAllResources);
router.get("/:username", resourceController.getResource);
router.post("/", isAdmin, resourceController.addResource);
router.delete("/:id", isAdmin, resourceController.deleteResource);

export default router;