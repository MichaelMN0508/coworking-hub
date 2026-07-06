import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { sendTelegramMessage } from "../services/notifyService";

const sessionInclude = {
  place: true,
  creator: true,
  participants: { include: { user: true } },
} as const;

function serializeSession(session: any, viewerId?: string) {
  return {
    id: session.id,
    title: session.title,
    topic: session.topic,
    description: session.description,
    startsAt: session.startsAt,
    maxParticipants: session.maxParticipants,
    customLocation: session.customLocation,
    place: session.place,
    creator: {
      id: session.creator.id,
      firstName: session.creator.firstName,
      lastName: session.creator.lastName,
      username: session.creator.username,
      photoUrl: session.creator.photoUrl,
    },
    participants: session.participants.map((p: any) => ({
      id: p.user.id,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      username: p.user.username,
      photoUrl: p.user.photoUrl,
    })),
    participantsCount: session.participants.length,
    isJoined: viewerId ? session.participants.some((p: any) => p.userId === viewerId) : false,
    isMine: viewerId ? session.creatorId === viewerId : false,
  };
}

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const { placeId, from } = req.query;
  const sessions = await prisma.session.findMany({
    where: {
      startsAt: { gte: from ? new Date(String(from)) : new Date() },
      ...(placeId ? { placeId: String(placeId) } : {}),
    },
    orderBy: { startsAt: "asc" },
    include: sessionInclude,
  });
  res.json(sessions.map((s) => serializeSession(s, req.userId)));
});

export const getMySessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await prisma.session.findMany({
    where: {
      OR: [{ creatorId: req.userId }, { participants: { some: { userId: req.userId } } }],
    },
    orderBy: { startsAt: "asc" },
    include: sessionInclude,
  });
  res.json(sessions.map((s) => serializeSession(s, req.userId)));
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.session.findUniqueOrThrow({
    where: { id: req.params.id },
    include: sessionInclude,
  });
  res.json(serializeSession(session, req.userId));
});

const createSessionSchema = z.object({
  title: z.string().min(1).max(120),
  topic: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  startsAt: z.string().datetime(),
  maxParticipants: z.number().int().positive().max(500).optional(),
  placeId: z.string().optional(),
  customLocation: z.string().max(200).optional(),
});

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const data = createSessionSchema.parse(req.body);
  if (!data.placeId && !data.customLocation) {
    throw new ApiError(400, "Either placeId or customLocation is required");
  }

  const session = await prisma.session.create({
    data: {
      title: data.title,
      topic: data.topic,
      description: data.description,
      startsAt: new Date(data.startsAt),
      maxParticipants: data.maxParticipants,
      placeId: data.placeId,
      customLocation: data.customLocation,
      creatorId: req.userId!,
      participants: { create: { userId: req.userId! } },
    },
    include: sessionInclude,
  });

  res.status(201).json(serializeSession(session, req.userId));
});

export const deleteSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.session.findUniqueOrThrow({ where: { id: req.params.id } });
  if (session.creatorId !== req.userId) {
    throw new ApiError(403, "Only the creator can cancel this session");
  }
  await prisma.session.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const joinSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.session.findUniqueOrThrow({
    where: { id: req.params.id },
    include: { participants: true, creator: true },
  });

  if (session.maxParticipants && session.participants.length >= session.maxParticipants) {
    throw new ApiError(400, "Session is full");
  }

  await prisma.participant.upsert({
    where: { sessionId_userId: { sessionId: session.id, userId: req.userId! } },
    update: {},
    create: { sessionId: session.id, userId: req.userId! },
  });

  if (session.creatorId !== req.userId) {
    const joiner = await prisma.user.findUnique({ where: { id: req.userId } });
    if (joiner) {
      void sendTelegramMessage(
        session.creator.telegramId,
        `👋 <b>${joiner.firstName}</b> присоединился(ась) к коворкингу «${session.title}»`
      );
    }
  }

  const updated = await prisma.session.findUniqueOrThrow({
    where: { id: session.id },
    include: sessionInclude,
  });
  res.json(serializeSession(updated, req.userId));
});

export const leaveSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await prisma.session.findUniqueOrThrow({ where: { id: req.params.id } });
  if (session.creatorId === req.userId) {
    throw new ApiError(400, "Creator cannot leave their own session, cancel it instead");
  }
  await prisma.participant.deleteMany({
    where: { sessionId: session.id, userId: req.userId },
  });
  const updated = await prisma.session.findUniqueOrThrow({
    where: { id: session.id },
    include: sessionInclude,
  });
  res.json(serializeSession(updated, req.userId));
});
