import { env } from "../env";

export async function sendTelegramMessage(telegramId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: telegramId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("Failed to send Telegram message:", res.status, body);
    }
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}
