import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";

const createBookingSchema = z.object({
  placeId: z.string(),
  date: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  peopleCount: z.number().int().positive().max(200),
  comment: z.string().max(1000).optional(),
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const data = createBookingSchema.parse(req.body);
  const booking = await prisma.bookingRequest.create({
    data: {
      placeId: data.placeId,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      peopleCount: data.peopleCount,
      comment: data.comment,
      userId: req.userId!,
    },
    include: { place: true },
  });
  res.status(201).json(booking);
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await prisma.bookingRequest.findMany({
    where: { userId: req.userId },
    include: { place: true },
    orderBy: { date: "asc" },
  });
  res.json(bookings);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await prisma.bookingRequest.findUniqueOrThrow({ where: { id: req.params.id } });
  if (booking.userId !== req.userId) {
    return res.status(403).json({ message: "Not your booking" });
  }
  await prisma.bookingRequest.update({
    where: { id: req.params.id },
    data: { status: "cancelled" },
  });
  res.status(204).send();
});
