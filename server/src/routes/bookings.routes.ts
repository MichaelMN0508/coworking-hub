import { Router } from "express";
import { cancelBooking, createBooking, getMyBookings } from "../controllers/bookings.controller";

export const bookingsRouter = Router();

bookingsRouter.get("/mine", getMyBookings);
bookingsRouter.post("/", createBooking);
bookingsRouter.delete("/:id", cancelBooking);
