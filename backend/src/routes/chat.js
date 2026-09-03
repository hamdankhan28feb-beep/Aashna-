import { Router } from "express";
import { chat } from "../controllers/chatController.js";

const router = Router();

// POST /api/chat  { message, history? } → { reply }
router.post("/", chat);

export default router;
