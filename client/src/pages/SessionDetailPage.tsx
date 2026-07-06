import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Session } from "../types";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    if (!id) return;
    api
      .get<Session>(`/sessions/${id}`)
      .then(setSession)
      .catch((err) => setError(err.message));
  }

  useEffect(load, [id]);

  async function join() {
    if (!id) return;
    setBusy(true);
    try {
      await api.post(`/sessions/${id}/join`);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!id) return;
    setBusy(true);
    try {
      await api.post(`/sessions/${id}/leave`);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function cancelSession() {
    if (!id) return;
    if (!confirm("Отменить эту встречу?")) return;
    setBusy(true);
    try {
      await api.delete(`/sessions/${id}`);
      navigate("/sessions");
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (error) return <p className="p-4 text-sm text-red-600">{error}</p>;
  if (!session) return <p className="p-4 text-sm text-muted">Загрузка...</p>;

  const full = session.maxParticipants ? session.participantsCount >= session.maxParticipants : false;

  return (
    <div className="space-y-4 p-4 pb-24">
      <button onClick={() => navigate(-1)} className="text-sm text-primary">
        ← Назад
      </button>
      <div>
        <h1 className="text-xl font-semibold text-ink">{session.title}</h1>
        <p className="text-sm text-muted">Тема: {session.topic}</p>
      </div>
      {session.description && <p className="text-sm">{session.description}</p>}
      <p className="text-sm">🗓️ {new Date(session.startsAt).toLocaleString("ru-RU")}</p>
      <p className="text-sm">
        📍{" "}
        {session.place ? (
          <Link to={`/places/${session.place.id}`} className="text-primary underline">
            {session.place.name}
          </Link>
        ) : (
          session.customLocation
        )}
      </p>
      <p className="text-sm text-muted">
        Организатор: {session.creator.firstName} {session.creator.username ? `(@${session.creator.username})` : ""}
      </p>

      <div>
        <h2 className="mb-2 font-semibold text-ink">
          Участники ({session.participantsCount}
          {session.maxParticipants ? `/${session.maxParticipants}` : ""})
        </h2>
        <div className="space-y-1">
          {session.participants.map((p) => (
            <p key={p.id} className="text-sm">
              {p.firstName} {p.lastName ?? ""} {p.username ? `· @${p.username}` : ""}
            </p>
          ))}
        </div>
      </div>

      {session.isMine ? (
        <button
          onClick={cancelSession}
          disabled={busy}
          className="w-full rounded-xl bg-red-600 py-2 font-medium text-white disabled:opacity-50"
        >
          Отменить встречу
        </button>
      ) : session.isJoined ? (
        <button
          onClick={leave}
          disabled={busy}
          className="w-full rounded-xl border border-red-600 py-2 font-medium text-red-600 disabled:opacity-50"
        >
          Больше не участвую
        </button>
      ) : (
        <button
          onClick={join}
          disabled={busy || full}
          className="w-full rounded-xl bg-primary py-2 font-medium text-white disabled:opacity-50"
        >
          {full ? "Мест нет" : "Присоединиться"}
        </button>
      )}
    </div>
  );
}
