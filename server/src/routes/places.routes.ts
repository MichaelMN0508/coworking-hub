import { Router } from "express";
import { getPlace, listPlaces } from "../controllers/places.controller";

export const placesRouter = Router();

placesRouter.get("/", listPlaces);
placesRouter.get("/:id", getPlace);
