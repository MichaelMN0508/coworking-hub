import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const places = [
  {
    name: "Библиотека им. Ленина, читальный зал 3",
    address: "ул. Воздвиженка, 3/5",
    lat: 55.7520,
    lng: 37.6086,
    description: "Тихая зона для индивидуальной и групповой работы, есть розетки на каждом столе.",
    pricePerHour: 0,
    pricePerDay: 0,
    amenities: "wifi,quiet-zone,power-outlets",
  },
  {
    name: "Коворкинг «Точка кипения»",
    address: "Кузнецкий Мост, 21/5",
    lat: 55.7602,
    lng: 37.6231,
    description: "Открытые рабочие места, переговорные комнаты, кофе включен.",
    pricePerHour: 300,
    pricePerDay: 1500,
    amenities: "wifi,coffee,meeting-rooms,printer",
  },
  {
    name: "Антикафе «ЗЕЛЕНАЯ КОМНАТА»",
    address: "Мясницкая ул., 13",
    lat: 55.7614,
    lng: 37.6339,
    description: "Оплата по времени, включены снеки и настолки для перерывов.",
    pricePerHour: 150,
    pricePerDay: null,
    amenities: "wifi,snacks,board-games",
  },
  {
    name: "Коворкинг НИУ ВШЭ",
    address: "Покровский бульвар, 11",
    lat: 55.7568,
    lng: 37.6537,
    description: "Студенческое пространство с проектными зонами и тихими кабинками.",
    pricePerHour: 0,
    pricePerDay: 0,
    amenities: "wifi,quiet-zone,project-rooms",
  },
  {
    name: "Коворкинг «Рабочая станция»",
    address: "Пятницкая ул., 25",
    lat: 55.7418,
    lng: 37.6288,
    description: "Лофт-пространство с большими столами для командной работы.",
    pricePerHour: 250,
    pricePerDay: 1200,
    amenities: "wifi,coffee,whiteboard,meeting-rooms",
  },
];

async function main() {
  for (const place of places) {
    const existing = await prisma.place.findFirst({ where: { name: place.name } });
    if (!existing) {
      await prisma.place.create({ data: place });
    }
  }
  console.log(`Seeded ${places.length} places.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
