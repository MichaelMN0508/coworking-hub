import { app } from "./app";
import { env } from "./env";
import { startBot } from "./bot";

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`);
});

// On a single-service deployment (e.g. Render free tier), run the bot in
// the same process so it shares the local SQLite file with the API.
if (process.env.ENABLE_BOT === "true") {
  startBot().catch((err) => console.error("Failed to start bot:", err));
}
