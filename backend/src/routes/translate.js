import { Router } from "express";
import { translateText } from "../controllers/translateController.js";

const router = Router();

// POST /api/translate  { text, target: "ur" | "en" }
router.post("/", translateText);

export default router;
