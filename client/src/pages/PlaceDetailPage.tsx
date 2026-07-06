import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Place } from "../types";
import { amenityLabels, formatPrice } from "../utils/amenities";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [place, setPlace] = useState<Place | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [peopleCount, setPeopleCount] = useState(2);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .get<Place>(`/places/${id}`)
      .then(setPlace)
      .catch((err) => setError(err.message));
  }, [id]);

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !date) return;
    setSubmitting(true);
    setBookingMessage(null);
    try {
      await api.post("/bookings", {
        placeId: id,
        date: new Date(date).toISOString(),
        startTime,
        endTime,
        peopleCount,
        comment: comment || undefined,
      });
      setBookingMessage("Заявка на бронирование отправлена!");
      setComment("");
    } catch (err: any) {
      setBookingMessage(err.message ?? "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <p className="p-4 text-sm text-red-600">{error}</p>;
  if (!place) return <p className="p-4 text-sm text-muted">Загрузка...</p>;

  return (
    <div className="space-y-4 p-4 pb-24">
      <button onClick={() => navigate(-1)} className="text-sm text-primary">
        ← Назад
      </button>
      <div>
        <h1 className="text-xl font-semibold text-ink">{place.name}</h1>
        <p className="text-sm text-muted">{place.address}</p>
      </div>
      {place.description && <p className="text-sm">{place.description}</p>}
      <p className="font-medium">{formatPrice(place.pricePerHour, place.pricePerDay)}</p>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {amenityLabels(place.amenities).map((label) => (
          <span key={label} className="rounded-full bg-slate-100 px-2 py-1">
            {label}
          </span>
        ))}
      </div>

      <Link
        to={`/sessions/new?placeId=${place.id}`}
        className="block w-full rounded-xl bg-primary py-2 text-center font-medium text-white"
      >
        Собрать встречу здесь
      </Link>

      <div>
        <h2 className="mb-2 font-semibold text-ink">Ближайшие встречи</h2>
        {(!place.sessions || place.sessions.length === 0) && (
          <p className="text-sm text-muted">Пока никто не назначил встречу здесь.</p>
        )}
        <div className="space-y-2">
          {place.sessions?.map((s) => (
            <Link
              key={s.id}
              to={`/sessions/${s.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-3"
            >
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted">
                {new Date(s.startsAt).toLocaleString("ru-RU")} · тема: {s.topic}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-ink">Забронировать место</h2>
        <form className="space-y-3" onSubmit={submitBooking}>
          <label className="block text-sm">
            Дата
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
          <div className="flex gap-2">
            <label className="block flex-1 text-sm">
              С
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              />
            </label>
            <label className="block flex-1 text-sm">
              До
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            Количество человек
            <input
              type="number"
              min={1}
              max={200}
              value={peopleCount}
              onChange={(e) => setPeopleCount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
          <label className="block text-sm">
            Комментарий
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              rows={2}
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-accent py-2 font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Отправка..." : "Отправить заявку"}
          </button>
          {bookingMessage && <p className="text-sm text-muted">{bookingMessage}</p>}
        </form>
      </div>
    </div>
  );
}
