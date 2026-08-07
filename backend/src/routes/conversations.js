import { Router } from "express";
import { requireAuth } from "../middleware/authentication.js";
import { saveConversation, getConversations } from "../controllers/conversationController.js";

const router = Router();

router.post("/", requireAuth, saveConversation);
router.get("/", requireAuth, getConversations);

export default router;
