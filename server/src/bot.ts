import { Bot, InlineKeyboard } from "grammy";
import { env } from "./env";
import { prisma } from "./prisma";

const bot = new Bot(env.botToken);

const isHttps = env.miniAppUrl.startsWith("https://");

bot.command("start", async (ctx) => {
  // Telegram only allows web_app buttons on HTTPS URLs; fall back to a
  // regular link button while the Mini App is only running on localhost.
  const keyboard = isHttps
    ? new InlineKeyboard().webApp("🏫 Открыть коворкинги", env.miniAppUrl)
    : new InlineKeyboard().url("🏫 Открыть коворкинги", env.miniAppUrl);
  await ctx.reply(
    "Привет! Это бот для студентов, которые хотят собраться поработать вместе.\n\n" +
      "Здесь можно посмотреть коворкинги на карте, создать встречу по теме, присоединиться к чужой или забронировать место.",
    { reply_markup: keyboard }
  );
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

async function setupMenuButton() {
  if (!isHttps) {
    console.warn(
      `Skipping menu button setup: MINI_APP_URL (${env.miniAppUrl}) is not HTTPS. ` +
        "Deploy the client and set a public HTTPS MINI_APP_URL to enable the persistent menu button."
    );
    return;
  }
  await bot.api.setChatMenuButton({
    menu_button: { type: "web_app", text: "Коворкинги", web_app: { url: env.miniAppUrl } },
  });
}

const REMINDER_LEAD_MINUTES = 30;

async function sendUpcomingReminders() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_LEAD_MINUTES * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      startsAt: { gte: now, lte: windowEnd },
      reminderSentAt: null,
    },
    include: { participants: { include: { user: true } }, place: true },
  });

  for (const session of sessions) {
    const where = session.place ? session.place.name : session.customLocation ?? "по договоренности";
    const text =
      `⏰ Скоро начнется коворкинг «${session.title}» (тема: ${session.topic})\n` +
      `Место: ${where}\n` +
      `Начало: ${session.startsAt.toLocaleString("ru-RU")}`;

    for (const participant of session.participants) {
      await bot.api.sendMessage(participant.user.telegramId, text).catch((err) => {
        console.error("Failed to send reminder:", err);
      });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { reminderSentAt: new Date() },
    });
  }
}

export async function startBot() {
  await setupMenuButton();
  console.log("Bot menu button configured, starting polling...");

  setInterval(() => {
    sendUpcomingReminders().catch((err) => console.error("Reminder job failed:", err));
  }, 60 * 1000);

  await bot.start();
}

// Allows `tsx src/bot.ts` / `node dist/bot.js` to run the bot standalone,
// while index.ts can also import startBot() to run it in the same process
// (needed when API + bot are deployed as a single service sharing SQLite).
if (require.main === module) {
  startBot().catch((err) => {
    console.error("Failed to start bot:", err);
    process.exit(1);
  });
}
