// Gemini API client for the Roleplay chatbot.
// The API key lives ONLY in backend/.env (server-side) — it is never sent to,
// embedded in, or referenced by any frontend file. The frontend talks to our
// own /api/chat endpoint, and this service talks to Google.

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// "gemini-flash-latest" is a stable alias that always points at the current
// Flash-class model — fast and cheap, ideal for short conversational replies.
// Override per environment via GEMINI_MODEL in backend/.env.
const DEFAULT_MODEL = "gemini-flash-latest";

const TIMEOUT_MS = 30_000;

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

/**
 * Call the Gemini generateContent endpoint.
 *
 * @param {object} params
 * @param {string} params.systemPrompt  Behavior instructions for the bot.
 * @param {Array<{role: "user"|"model", parts: [{text: string}]}>} params.contents
 *        Conversation turns in Gemini's format, oldest first, ending with the
 *        user's new message.
 * @returns {Promise<string>} The bot's reply text.
 */
export async function generateChatReply({ systemPrompt, contents }) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  if (!apiKey) {
    throw httpError(503, "Chat service is not configured (missing API key on the server)");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.8,
          // Current Flash models are "thinking" models — their internal reasoning
          // tokens count against maxOutputTokens, which silently truncated early
          // replies. Chat replies don't need reasoning: disable it and keep a
          // generous ceiling as a safety net.
          maxOutputTokens: 500,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const upstreamStatus = json?.error?.status;
      if (res.status === 429 || upstreamStatus === "RESOURCE_EXHAUSTED") {
        throw httpError(429, "The chatbot is receiving too many requests — please wait a moment and try again");
      }
      throw httpError(502, "The chatbot service failed to generate a reply");
    }

    // A candidate can be missing entirely when content safety blocks the turn.
    const text = json?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!text) {
      throw httpError(502, "The chatbot could not generate a reply for that message");
    }

    return text;
  } catch (e) {
    if (e.name === "AbortError") {
      throw httpError(504, "The chatbot took too long to reply — please try again");
    }
    throw e; // already-shaped HTTP errors pass straight through to the error handler
  } finally {
    clearTimeout(timer);
  }
}
