import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Session } from "../types";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get<Session[]>("/sessions")
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="space-y-3 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-ink">Предстоящие встречи</h1>
        <Link to="/sessions/new" className="text-sm font-medium text-primary">
          + Создать
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-muted">Загрузка...</p>}
      {!loading && sessions.length === 0 && (
        <p className="text-sm text-muted">Пока нет запланированных встреч. Создайте первую!</p>
      )}
      <div className="space-y-2">
        {sessions.map((s) => (
          <Link
            key={s.id}
            to={`/sessions/${s.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{s.title}</p>
              {s.isJoined && <span className="text-xs text-primary">Вы участвуете</span>}
            </div>
            <p className="text-xs text-muted">
              {new Date(s.startsAt).toLocaleString("ru-RU")} · тема: {s.topic}
            </p>
            <p className="text-xs text-muted">
              📍 {s.place ? s.place.name : s.customLocation} · {s.participantsCount}
              {s.maxParticipants ? `/${s.maxParticipants}` : ""} участников
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
