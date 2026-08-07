import rateLimit from "express-rate-limit";

// PRD NFR 4.5: 1000 requests/min per user
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
