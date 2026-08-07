// TODO: back this with Firestore's signs/ collection (see Architecture doc 4.1)
const CLASSES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export async function listSigns(_req, res, next) {
  try {
    const signs = CLASSES.map((letter) => ({ letter, category: "letter" }));
    res.json({ signs });
  } catch (err) {
    next(err);
  }
}
