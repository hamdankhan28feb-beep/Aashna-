// TODO: wire up services/firebaseDB.js (Firestore reads/writes)
export async function saveConversation(req, res, next) {
  try {
    res.status(501).json({ error: { message: "Not yet implemented" } });
  } catch (err) {
    next(err);
  }
}

export async function getConversations(req, res, next) {
  try {
    res.status(501).json({ error: { message: "Not yet implemented" } });
  } catch (err) {
    next(err);
  }
}
