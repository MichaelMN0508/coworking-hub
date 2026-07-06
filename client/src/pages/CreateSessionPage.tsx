import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { Place, Session } from "../types";

export default function CreateSessionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [placeId, setPlaceId] = useState(searchParams.get("placeId") ?? "");
  const [customLocation, setCustomLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Place[]>("/places").then(setPlaces).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("Укажите дату и время встречи");
      return;
    }
    if (!placeId && !customLocation) {
      setError("Выберите место из списка или укажите своё");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      const session = await api.post<Session>("/sessions", {
        title,
        topic,
        description: description || undefined,
        startsAt,
        maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        placeId: placeId || undefined,
        customLocation: placeId ? undefined : customLocation,
      });
      navigate(`/sessions/${session.id}`);
    } catch (err: any) {
      setError(err.message ?? "Не удалось создать встречу");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <h1 className="text-lg font-semibold text-ink">Новая встреча</h1>
      <form className="space-y-3" onSubmit={submit}>
        <label className="block text-sm">
          Название
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Готовимся к экзамену по матанализу"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="block text-sm">
          Тема для обсуждения / работы
          <input
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Например: матанализ, курсовая, английский"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <label className="block text-sm">
          Описание (необязательно)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        <div className="flex gap-2">
          <label className="block flex-1 text-sm">
            Дата
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
          <label className="block flex-1 text-sm">
            Время
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
        </div>
        <label className="block text-sm">
          Место из списка коворкингов
          <select
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          >
            <option value="">— не выбрано —</option>
            {places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {!placeId && (
          <label className="block text-sm">
            Своё место
            <input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Например: библиотека МГУ, 2 этаж"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
            />
          </label>
        )}
        <label className="block text-sm">
          Максимум участников (необязательно)
          <input
            type="number"
            min={1}
            max={500}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Создание..." : "Создать встречу"}
        </button>
      </form>
    </div>
  );
}
