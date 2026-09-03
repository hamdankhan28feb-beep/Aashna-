import { generateChatReply } from "../services/geminiService.js";

// Core prompt requested for this feature, plus operational context about how
// the user's messages are produced (camera-based ASL fingerspelling).
const SYSTEM_PROMPT = `You are a friendly conversation partner helping someone practice sign language communication scenarios. Keep replies short, simple, and encouraging.

Context: the user is Deaf or hard of hearing and is communicating via American Sign Language (ASL) fingerspelling, recognized letter-by-letter by a camera. Their messages may be in ALL CAPS, very short, or occasionally misspelled — always interpret them charitably and respond to the intended meaning.

Guidelines:
- Keep every reply to 1-2 short sentences with simple, everyday vocabulary.
- Be warm and encouraging; celebrate the user's effort.
- Ask one simple follow-up question to keep the conversation flowing.
- Stay in casual, everyday scenarios (greetings, hobbies, feelings, food, daily life).`;

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_ITEMS = 20;

/**
 * POST /api/chat
 * Body: { message: string, history?: Array<{ sender: "user"|"bot", text: string }> }
 * Returns: { reply: string }
 */
export async function chat(req, res, next) {
  try {
    const { message, history } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: { message: "message is required" } });
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return res
        .status(400)
        .json({ error: { message: `message must be at most ${MAX_MESSAGE_CHARS} characters` } });
    }
    if (history !== undefined && !Array.isArray(history)) {
      return res.status(400).json({ error: { message: "history must be an array" } });
    }

    // Map our chat log into Gemini's contents format (role "model" = the bot).
    const contents = [];
    for (const turn of (history ?? []).slice(-MAX_HISTORY_ITEMS)) {
      const senderOk = turn && (turn.sender === "user" || turn.sender === "bot");
      const textOk = typeof turn?.text === "string" && turn.text.trim() && turn.text.length <= MAX_MESSAGE_CHARS;
      if (!senderOk || !textOk) {
        return res.status(400).json({
          error: { message: "each history item must be { sender: 'user'|'bot', text } (max 1000 chars)" },
        });
      }
      contents.push({
        role: turn.sender === "user" ? "user" : "model",
        parts: [{ text: turn.text.trim() }],
      });
    }
    contents.push({ role: "user", parts: [{ text: message.trim() }] });

    const reply = await generateChatReply({ systemPrompt: SYSTEM_PROMPT, contents });
    res.json({ reply });
  } catch (err) {
    next(err); // errorHandler honors err.status
  }
}
