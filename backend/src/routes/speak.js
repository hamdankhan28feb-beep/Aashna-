import { Router } from "express";
import { synthesizeSpeech } from "../controllers/speakController.js";

const router = Router();

// POST /api/speak  { text, lang: "en-US" | "ur-PK" }
router.post("/", synthesizeSpeech);

export default router;
