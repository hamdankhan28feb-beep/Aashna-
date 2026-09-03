import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimit.js";

import translateRoutes from "./routes/translate.js";
import speakRoutes from "./routes/speak.js";
import conversationRoutes from "./routes/conversations.js";
import signRoutes from "./routes/signs.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(rateLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/translate", translateRoutes);
app.use("/api/speak", speakRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/signs", signRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sign Language Bridge API listening on http://localhost:${PORT}`);
});
