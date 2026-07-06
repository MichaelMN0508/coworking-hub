import cors from "cors";
import express from "express";
import { env } from "./env";
import { telegramAuth } from "./middleware/telegramAuth";
import { errorHandler } from "./middleware/errorHandler";
import { placesRouter } from "./routes/places.routes";
import { sessionsRouter } from "./routes/sessions.routes";
import { bookingsRouter } from "./routes/bookings.routes";

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header) and any configured client URL.
      if (!origin || env.clientUrls.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(telegramAuth());

app.use("/api/places", placesRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/bookings", bookingsRouter);

app.use(errorHandler);
