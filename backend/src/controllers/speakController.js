// TODO: wire up services/googleTTS.js (Google Cloud Text-to-Speech)
// Note: Web Speech API (browser-native, free) can also be used client-side
// for the MVP per Architecture doc 3.3 — this endpoint is the paid/high-quality option.
export async function synthesizeSpeech(req, res, next) {
  try {
    const { text, lang } = req.body;
    if (!text) {
      return res.status(400).json({ error: { message: "text is required" } });
    }
    res.status(501).json({ error: { message: "TTS service not yet implemented" }, text, lang });
  } catch (err) {
    next(err);
  }
}
