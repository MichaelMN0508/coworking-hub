import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { BookingRequest, Session } from "../types";

export default function MyPage() {
  const [tab, setTab] = useState<"sessions" | "bookings">("sessions");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Session[]>("/sessions/mine").then(setSessions).catch((err) => setError(err.message));
    api
      .get<BookingRequest[]>("/bookings/mine")
      .then(setBookings)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-3 p-4 pb-24">
      <h1 className="text-lg font-semibold text-ink">Моё</h1>
      <div className="flex gap-2">
        <button
          onClick={() => setTab("sessions")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            tab === "sessions" ? "bg-primary text-white" : "bg-slate-100 text-ink"
          }`}
        >
          Встречи
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            tab === "bookings" ? "bg-primary text-white" : "bg-slate-100 text-ink"
          }`}
        >
          Брони
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {tab === "sessions" && (
        <div className="space-y-2">
          {sessions.length === 0 && <p className="text-sm text-muted">Вы пока не создавали и не посещали встречи.</p>}
          {sessions.map((s) => (
            <Link
              key={s.id}
              to={`/sessions/${s.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-3"
            >
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted">
                {new Date(s.startsAt).toLocaleString("ru-RU")} · {s.isMine ? "вы организатор" : "вы участник"}
              </p>
            </Link>
          ))}
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-2">
          {bookings.length === 0 && <p className="text-sm text-muted">Заявок на аренду пока нет.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-medium">{b.place.name}</p>
              <p className="text-xs text-muted">
                {new Date(b.date).toLocaleDateString("ru-RU")}, {b.startTime}–{b.endTime} · {b.peopleCount} чел.
              </p>
              <p className="text-xs text-muted">
                Статус:{" "}
                {b.status === "pending" ? "ожидает подтверждения" : b.status === "confirmed" ? "подтверждена" : "отменена"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
