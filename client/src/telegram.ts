interface TelegramWebApp {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  ready: () => void;
  expand: () => void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  BackButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void };
  HapticFeedback?: { impactOccurred: (style: string) => void };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getTelegram(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

export function initTelegram() {
  const tg = getTelegram();
  if (tg) {
    tg.ready();
    tg.expand();
  }
}

export function getInitData(): string {
  return getTelegram()?.initData ?? "";
}
