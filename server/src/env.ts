import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  botToken: required("BOT_TOKEN"),
  // Comma-separated list of allowed client origins, e.g. for local dev plus a Vercel deployment.
  clientUrls: (process.env.CLIENT_URL ?? "http://localhost:5173")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  miniAppUrl: process.env.MINI_APP_URL ?? "http://localhost:5173",
};
