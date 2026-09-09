"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./legacy-informes.css";

type ReportItem = { id: string; orderId: string; orderNumber: string; authorId: string; equipmentCondition: string; reportDate: string; hasBudget: boolean; createdAt: string };
type ReportList = { page: number; pageSize: number; total: number; items: ReportItem[] };
type Report = { id: string; orderId: string; authorId: string; background: string | null; process: string | null; conclusion: string | null; recommendations: string | null; equipmentCondition: string; reportDate: string; budgetJson: string | null; createdAt: string };

export const equipmentConditions = ["Operativo", "Reparado parcialmente", "Sin reparación posible", "Desguace", "En espera de repuesto"];
const conditionClass: Record<string, string> = {
  "Operativo": "est-operativo", "Reparado parcialmente": "est-reparado", "Sin reparación posible": "est-sinrep",
  "Desguace": "est-desguace", "En espera de repuesto": "est-espera",
};

// ── Listado (mis informes / buscar) ───────────────────────────────
export function ReportsList({ mine = false }: { mine?: boolean }) {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [condition, setCondition] = useState("");
  const [detail, setDetail] = useState<Report | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (mine) params.set("mine", "true");
      const data = await api<ReportList>(`/api/reports?${params.toString()}`);
      setItems(data.items); setTotal(data.total);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene el permiso informes/ver." : "No se pudo cargar los informes.");
    } finally { setLoading(false); }
  }, [mine]);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    return items.filter((r) => (!q || r.orderNumber.toLowerCase().includes(q)) && (!condition || r.equipmentCondition === condition));
  }, [items, text, condition]);

  async function openDetail(id: string) {
    try { setDetail(await api<Report>(`/api/reports/${id}`)); }
    catch { setError("No se pudo abrir el informe."); }
  }

  return <section className="mi-wrap">
    <div className="mi-hdr">
      <div className="mi-hdr-left"><h2><i className="bi bi-journal-text" /> {mine ? "Mis informes" : "Buscar informes técnicos"}</h2><p>{mine ? "Informes técnicos que has generado." : "Consulta informes técnicos por número de orden."}</p></div>
      <Link href="/operaciones/informes/crear" className="mi-btn-nuevo"><i className="bi bi-file-earmark-plus" /> Crear informe</Link>
    </div>

    <div className="mi-filtros">
      <label><i className="bi bi-funnel" /></label>
      <input className="grow" value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar por número de orden…" />
      <label>Estado equipo:</label>
      <select value={condition} onChange={(e) => setCondition(e.target.value)}><option value="">— Todos —</option>{equipmentConditions.map((c) => <option key={c}>{c}</option>)}</select>
      <span className="mi-count">{loading ? "…" : visible.length} de {total} informe(s)</span>
    </div>

    {error ? <div className="mi-error">{error}</div>
      : loading ? <div className="mi-table-wrap"><div className="mi-empty">Cargando…</div></div>
      : visible.length === 0 ? <div className="mi-table-wrap"><div className="mi-empty"><i className="bi bi-journal-x" /><p>No hay informes que coincidan.</p></div></div>
      : <div className="mi-table-wrap"><table className="mi-table">
          <thead><tr><th>Nro. Orden</th><th>Fecha</th><th>Estado equipo</th><th>Presupuesto</th></tr></thead>
          <tbody>{visible.map((r) => <tr key={r.id} onClick={() => void openDetail(r.id)}>
            <td><span className="mi-nro">{r.orderNumber}</span></td>
            <td>{new Date(r.reportDate).toLocaleDateString("es-EC")}</td>
            <td><span className={`est-badge ${conditionClass[r.equipmentCondition] ?? "est-otro"}`}>{r.equipmentCondition}</span></td>
            <td>{r.hasBudget ? "Sí" : "—"}</td>
          </tr>)}</tbody>
        </table></div>}

    {detail && <div className="inf-modal-overlay" onClick={() => setDetail(null)}>
      <div className="inf-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="inf-modal-hdr"><h3>Informe · orden {items.find((i) => i.id === detail.id)?.orderNumber ?? ""}</h3><button className="inf-modal-close" onClick={() => setDetail(null)}><i className="bi bi-x" /></button></div>
        <div className="inf-modal-body">
          <div className="inf-field"><label>Estado del equipo</label><p>{detail.equipmentCondition}</p></div>
          <div className="inf-field"><label>Fecha</label><p>{new Date(detail.reportDate).toLocaleDateString("es-EC")}</p></div>
          <div className="inf-field"><label>Antecedentes</label><p>{detail.background || "—"}</p></div>
          <div className="inf-field"><label>Proceso</label><p>{detail.process || "—"}</p></div>
          <div className="inf-field"><label>Conclusión</label><p>{detail.conclusion || "—"}</p></div>
          <div className="inf-field"><label>Recomendaciones</label><p>{detail.recommendations || "—"}</p></div>
          <Link href={`/operaciones/ordenes/${detail.orderId}`} className="mi-btn-nuevo" style={{ width: "fit-content" }}><i className="bi bi-eye" /> Ver orden</Link>
        </div>
      </div>
    </div>}
  </section>;
}

// ── Crear informe ─────────────────────────────────────────────────
type OrderLookup = { newOrder: { id: string; displayNumber: string; branchCode: string; status: string; serviceMode: string | null } | null };

export function ReportCreate() {
  const [number, setNumber] = useState("");
  const [order, setOrder] = useState<OrderLookup["newOrder"] | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function lookup(event: FormEvent) {
    event.preventDefault(); if (!number.trim()) return;
    setLooking(true); setLookupError(""); setOrder(null); setMsg(null);
    try {
      const result = await api<OrderLookup>(`/api/orders/lookup/${encodeURIComponent(number.trim())}`);
      if (!result.newOrder) { setLookupError("Esa orden es del histórico legacy; no admite informes nuevos."); return; }
      setOrder(result.newOrder);
    } catch (e) { setLookupError(e instanceof ApiError && e.status === 404 ? "No se encontró esa orden." : "No se pudo buscar la orden."); }
    finally { setLooking(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!order) return;
    const form = new FormData(event.currentTarget);
    const background = String(form.get("background") ?? "").trim();
    const process = String(form.get("process") ?? "").trim();
    if (!background || !process) { setMsg({ kind: "err", text: "Antecedentes y proceso son obligatorios." }); return; }
    setSaving(true); setMsg(null);
    try {
      await api(`/api/orders/${order.id}/reports`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          authorId: "", background, process,
          conclusion: form.get("conclusion") || null,
          recommendations: form.get("recommendations") || null,
          equipmentCondition: form.get("equipmentCondition"),
          reportDate: form.get("reportDate") || null,
          budgetJson: null,
        }),
      });
      setMsg({ kind: "ok", text: "Informe guardado." });
      event.currentTarget.reset();
    } catch (e) { setMsg({ kind: "err", text: e instanceof ApiError ? e.message : "No se pudo guardar el informe." }); }
    finally { setSaving(false); }
  }

  const today = new Date().toISOString().slice(0, 10);

  return <section className="ci-wrap">
    <div className="ci-hdr">
      <div><h2><i className="bi bi-file-earmark-plus" /> Crear informe técnico</h2><p>Busca la orden y redacta el informe.</p></div>
      <Link href="/operaciones/mis-informes" className="ci-btn ci-btn-limpiar"><i className="bi bi-journal-text" /> Mis informes</Link>
    </div>

    <form className="ci-card" onSubmit={lookup}>
      <div className="ci-card-hd"><span className="ci-step">1</span><h3>Buscar orden de servicio</h3></div>
      <div className="ci-card-body">
        <div className="ci-search-row">
          <div className="ci-input-wrap"><i className="bi bi-search" /><input className="ci-input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Ej.: UIO-1001" /></div>
          <button className="ci-btn-buscar" disabled={looking}><i className="bi bi-search" /> {looking ? "Buscando…" : "Buscar"}</button>
        </div>
        {lookupError && <div className="ci-msg ci-msg-err" style={{ marginTop: 12 }}>{lookupError}</div>}
      </div>
    </form>

    {order && <form onSubmit={save}>
      <div className="ci-resumen">
        <div><span className="ci-res-lbl">Nro. orden</span><span className="ci-res-val">{order.displayNumber}</span></div>
        <div><span className="ci-res-lbl">Sucursal</span><span className="ci-res-val">{order.branchCode}</span></div>
        <div><span className="ci-res-lbl">Estado</span><span className="ci-res-val">{order.status}</span></div>
      </div>

      <div className="ci-card">
        <div className="ci-card-hd"><span className="ci-step">2</span><h3>Redactar informe</h3></div>
        <div className="ci-card-body">
          <div className="ci-grid-2">
            <div className="ci-campo"><label>Antecedentes <span className="req">*</span></label><textarea name="background" rows={4} /></div>
            <div className="ci-campo"><label>Proceso <span className="req">*</span></label><textarea name="process" rows={4} /></div>
          </div>
          <div className="ci-grid-2">
            <div className="ci-campo"><label>Conclusión</label><textarea name="conclusion" rows={3} /></div>
            <div className="ci-campo"><label>Recomendaciones</label><textarea name="recommendations" rows={3} /></div>
          </div>
          <div className="ci-grid-2">
            <div className="ci-campo"><label>Estado final del equipo <span className="req">*</span></label><select name="equipmentCondition" defaultValue={equipmentConditions[0]}>{equipmentConditions.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="ci-campo"><label>Fecha del informe</label><input type="date" name="reportDate" defaultValue={today} /></div>
          </div>
        </div>
      </div>

      {msg && <div className={`ci-msg ci-msg-${msg.kind === "ok" ? "ok" : "err"}`}>{msg.text}</div>}
      <div className="ci-botones">
        <button type="button" className="ci-btn ci-btn-limpiar" onClick={() => { setOrder(null); setNumber(""); setMsg(null); }}><i className="bi bi-arrow-left" /> Cambiar orden</button>
        <button className="ci-btn ci-btn-guardar" disabled={saving}><i className="bi bi-floppy" /> {saving ? "Guardando…" : "Guardar informe"}</button>
      </div>
    </form>}
  </section>;
}
