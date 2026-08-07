// TODO: wire up services/googleTranslate.js (Google Cloud Translation API)
export async function translateText(req, res, next) {
  try {
    const { text, target } = req.body;
    if (!text || !target) {
      return res.status(400).json({ error: { message: "text and target are required" } });
    }
    // Placeholder response until googleTranslate.js is implemented
    res.json({ original: text, translated: text, target });
  } catch (err) {
    next(err);
  }
}
