import { Router } from "express";
import {
  createSession,
  deleteSession,
  getMySessions,
  getSession,
  joinSession,
  leaveSession,
  listSessions,
} from "../controllers/sessions.controller";

export const sessionsRouter = Router();

sessionsRouter.get("/", listSessions);
sessionsRouter.get("/mine", getMySessions);
sessionsRouter.get("/:id", getSession);
sessionsRouter.post("/", createSession);
sessionsRouter.delete("/:id", deleteSession);
sessionsRouter.post("/:id/join", joinSession);
sessionsRouter.post("/:id/leave", leaveSession);
