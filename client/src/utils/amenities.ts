const LABELS: Record<string, string> = {
  wifi: "📶 Wi-Fi",
  coffee: "☕ Кофе",
  snacks: "🍪 Снеки",
  "quiet-zone": "🤫 Тихая зона",
  "power-outlets": "🔌 Розетки",
  "meeting-rooms": "🧑‍🤝‍🧑 Переговорные",
  "project-rooms": "🧩 Проектные зоны",
  printer: "🖨️ Принтер",
  whiteboard: "📋 Доска",
  "board-games": "🎲 Настолки",
};

export function amenityLabels(amenities: string | null): string[] {
  if (!amenities) return [];
  return amenities
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => LABELS[a] ?? a);
}

export function formatPrice(pricePerHour: number | null, pricePerDay: number | null): string {
  if (!pricePerHour && !pricePerDay) return "Бесплатно";
  const parts: string[] = [];
  if (pricePerHour) parts.push(`${pricePerHour} ₽/час`);
  if (pricePerDay) parts.push(`${pricePerDay} ₽/день`);
  return parts.join(" · ");
}
