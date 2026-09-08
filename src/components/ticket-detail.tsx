"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./ticket-detail.css";

type Ticket = { code: string; type: string; category: string; priority: string; status: string; title: string };
type Message = { id: string; body: string; isInternalNote: boolean; statusChange: string | null; createdAt: string };
type Attachment = { id: string; fileName: string; isAvailable: boolean };
type Detail = { ticket: Ticket; description: string; originCompany: string; storeName: string | null; contactPhone: string | null; resolution: string | null; mbaTicketNumber: string | null; messages: Message[]; attachments: Attachment[]; calls: { id: string; status: string; durationSeconds: number; startedAt: string | null }[] };

const statuses = [["Open", "Abierto"], ["InProgress", "En proceso"], ["Waiting", "En espera"], ["InMba", "En MBA"], ["Resolved", "Resuelto"], ["Closed", "Cerrado"]];

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [resolution, setResolution] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const result = await api<Detail>(`/api/tickets/${ticketId}`); setDetail(result); setStatus(result.ticket.status); }
    catch (exception) { setError(exception instanceof ApiError ? exception.message : "No se pudo cargar el ticket."); }
  }, [ticketId]);
  useEffect(() => { void load(); }, [load]);

  async function run(action: () => Promise<unknown>) {
    setSaving(true); setError("");
    try { await action(); await load(); }
    catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible guardar el cambio."); }
    finally { setSaving(false); }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault(); if (!body.trim()) return;
    await run(() => api(`/api/tickets/${ticketId}/messages`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ body, isInternalNote: internal, statusChange: null }) }));
    setBody(""); setInternal(false);
  }

  async function changeStatus(event: FormEvent) {
    event.preventDefault(); if (!reason.trim()) { setError("La razón del cambio es obligatoria."); return; }
    await run(() => api(`/api/tickets/${ticketId}/status`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ status, reason, resolution: resolution || null }) }));
    setReason(""); setResolution("");
  }

  async function upload(event: FormEvent) {
    event.preventDefault(); if (!file) return;
    const data = new FormData(); data.append("file", file);
    await run(() => api(`/api/tickets/${ticketId}/attachments`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: data }));
    setFile(null);
  }

  if (!detail) return <section className={error ? "td-error" : "td-loading"}>{error || "Cargando ticket…"}</section>;
  const { ticket } = detail;
  return <section className="td-wrap">
    <header className="td-head"><div><span>{ticket.code}</span><h2>{ticket.title}</h2><p>{ticket.category} · {ticket.type} · {ticket.priority}</p></div><b>{ticket.status}</b></header>
    {error && <p className="td-error">{error}</p>}
    <div className="td-grid">
      <article><h3><i className="bi bi-card-text" /> Solicitud</h3><p>{detail.description}</p><dl><div><dt>Empresa origen</dt><dd>{detail.originCompany}</dd></div><div><dt>Tienda</dt><dd>{detail.storeName || "—"}</dd></div><div><dt>Contacto</dt><dd>{detail.contactPhone || "—"}</dd></div><div><dt>Ticket MBA</dt><dd>{detail.mbaTicketNumber || "—"}</dd></div></dl>{detail.resolution && <div className="td-resolution"><strong>Resolución</strong><p>{detail.resolution}</p></div>}</article>
      <article><h3><i className="bi bi-chat-left-text" /> Conversación</h3>{detail.messages.length ? <ul className="td-history">{detail.messages.map((message) => <li key={message.id} className={message.isInternalNote ? "internal" : ""}><p>{message.body}</p>{message.statusChange && <small>Estado: {message.statusChange}</small>}<time>{new Date(message.createdAt).toLocaleString("es-EC")}</time></li>)}</ul> : <p className="td-empty">Sin mensajes.</p>}<form className="td-reply" onSubmit={sendMessage}><textarea value={body} onChange={(event) => setBody(event.target.value)} required rows={3} placeholder="Escribe una respuesta…" /><label><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Nota interna</label><button disabled={saving}>Enviar mensaje</button></form></article>
      <article><h3><i className="bi bi-arrow-repeat" /> Gestión</h3><form className="td-reply" onSubmit={changeStatus}><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><textarea value={reason} onChange={(event) => setReason(event.target.value)} required rows={2} placeholder="Razón del cambio" />{status === "Resolved" && <textarea value={resolution} onChange={(event) => setResolution(event.target.value)} rows={3} required placeholder="Resolución aplicada" />}<button disabled={saving}>Cambiar estado</button></form></article>
      <article><h3><i className="bi bi-paperclip" /> Adjuntos</h3>{detail.attachments.length ? <ul className="td-files">{detail.attachments.map((item) => <li key={item.id}>{item.fileName}<small>{item.isAvailable ? "Disponible" : "Archivo legacy pendiente de copiar"}</small></li>)}</ul> : <p className="td-empty">Sin adjuntos.</p>}<form className="td-reply" onSubmit={upload}><input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required /><button disabled={saving || !file}>Subir archivo</button></form></article>
      <article><h3><i className="bi bi-telephone" /> Llamadas</h3>{detail.calls.length ? <ul className="td-files">{detail.calls.map((call) => <li key={call.id}>{call.status}<small>{call.durationSeconds}s {call.startedAt ? `· ${new Date(call.startedAt).toLocaleString("es-EC")}` : ""}</small></li>)}</ul> : <p className="td-empty">Sin llamadas.</p>}</article>
    </div>
  </section>;
}
