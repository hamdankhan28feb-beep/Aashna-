import { Router } from "express";
import { listSigns } from "../controllers/signController.js";

const router = Router();

// GET /api/signs — sign library & metadata (letters, numbers, phrases, emoji)
router.get("/", listSigns);

export default router;
