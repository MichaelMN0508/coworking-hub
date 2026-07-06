import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { env } from "../env";
import { prisma } from "../prisma";
import { ApiError } from "../utils/ApiError";

interface TelegramUserPayload {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function verifyInitData(initData: string, botToken: string): TelegramUserPayload {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new ApiError(401, "Missing initData hash");
  }
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    throw new ApiError(401, "Invalid initData signature");
  }

  const authDate = Number(params.get("auth_date") ?? 0);
  const ageSeconds = Date.now() / 1000 - authDate;
  if (ageSeconds > 24 * 60 * 60) {
    throw new ApiError(401, "initData expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new ApiError(401, "Missing user in initData");
  }
  return JSON.parse(userRaw) as TelegramUserPayload;
}

export function telegramAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const initData = req.header("X-Telegram-Init-Data");

      let tgUser: TelegramUserPayload;
      if (!initData) {
        if (process.env.NODE_ENV === "production") {
          throw new ApiError(401, "Missing X-Telegram-Init-Data header");
        }
        // Dev-only fallback so the app is testable outside real Telegram.
        tgUser = { id: 1, first_name: "Dev", username: "dev_user" };
      } else {
        tgUser = verifyInitData(initData, env.botToken);
      }

      const user = await prisma.user.upsert({
        where: { telegramId: String(tgUser.id) },
        update: {
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          photoUrl: tgUser.photo_url,
        },
        create: {
          telegramId: String(tgUser.id),
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          photoUrl: tgUser.photo_url,
        },
      });

      req.userId = user.id;
      next();
    } catch (err) {
      next(err);
    }
  };
}
