import { Request, Response } from "express";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const listPlaces = asyncHandler(async (_req: Request, res: Response) => {
  const places = await prisma.place.findMany({
    include: {
      _count: { select: { sessions: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json(places);
});

export const getPlace = asyncHandler(async (req: Request, res: Response) => {
  const place = await prisma.place.findUniqueOrThrow({
    where: { id: req.params.id },
    include: {
      sessions: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        include: { creator: true, _count: { select: { participants: true } } },
      },
    },
  });
  res.json(place);
});
