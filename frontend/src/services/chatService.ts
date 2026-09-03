// Client for the backend chatbot endpoint (POST /api/chat).
// Uses a relative URL — the Vite dev server proxies /api to localhost:3000
// (see vite.config.ts), and in production both are served from the same origin.
// The Gemini API key never appears here: it lives only in backend/.env.

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

/**
 * Send the user's message (plus prior conversation history for context) to
 * the chatbot and return the bot's reply text.
 *
 * @throws Error with a user-friendly message on network failure, a non-2xx
 *         response, or a malformed response body.
 */
export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
  } catch {
    throw new Error("Can't reach the chat service — is the backend running?");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || typeof data?.reply !== 'string' || !data.reply) {
    throw new Error(data?.error?.message || 'Chat request failed');
  }
  return data.reply;
}
