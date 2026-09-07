"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

type Order = {
  id: string;
  displayNumber: string;
  branchCode: string;
  serviceMode: string | null;
  status: string;
  issueDescription: string | null;
  observation: string | null;
  invoiceNumber: string | null;
  createdAt: string;
  history: { from: string | null; to: string; reason: string; occurredAt: string }[];
};
type Workflow = { order: Order; evidence: { type: string; fileName: string; createdAt: string }[]; partsRequest: unknown | null };
type PartItem = { description: string; quantity: number };

export function OrderDetail({ orderId }: { orderId: string }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [requiresParts, setRequiresParts] = useState(false);
  const [parts, setParts] = useState<PartItem[]>([{ description: "", quantity: 1 }]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setWorkflow(await api<Workflow>(`/api/orders/${orderId}/workflow`)); }
    catch (exception) { setError(exception instanceof ApiError ? exception.message : "No se pudo cargar la orden."); }
    finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { void load(); }, [load]);

  async function decide(path: string, approved?: boolean) {
    if (!reason.trim()) { setError("Escribe la razón técnica antes de continuar."); return; }
    setSaving(true); setError("");
    try {
      await api(path, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(approved === undefined ? { reason } : { approved, reason }) });
      setReason("");
      await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible actualizar la orden."); }
    finally { setSaving(false); }
  }

  async function routeRepair() {
    if (!reason.trim()) { setError("Escribe la razón técnica antes de continuar."); return; }
    setSaving(true); setError("");
    try {
      await api(`/api/orders/${orderId}/warranty/repair-routing`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ requiresParts, reason }) });
      setReason(""); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible enrutar reparación."); }
    finally { setSaving(false); }
  }

  async function requestParts() {
    const items = parts.filter((item) => item.description.trim());
    if (!items.length) { setError("Agrega al menos un repuesto."); return; }
    setSaving(true); setError("");
    try {
      await api(`/api/orders/${orderId}/parts-request`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ notes: reason || null, items }) });
      setReason(""); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible solicitar repuestos."); }
    finally { setSaving(false); }
  }

  async function completeRepair() {
    if (!reason.trim()) { setError("Ingresa conclusión técnica de reparación."); return; }
    setSaving(true); setError("");
    try {
      await api(`/api/orders/${orderId}/repair-completion`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ technicalConclusion: reason }) });
      setReason(""); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible completar reparación."); }
    finally { setSaving(false); }
  }

  if (loading) return <section className="panel no-data">Cargando orden…</section>;
  if (!workflow) return <section className="panel form-error">{error || "Orden no encontrada."}</section>;
  const { order } = workflow;
  const directDecision = order.serviceMode === "DirectRepair" && order.status === "TechnicalQueue";
  const startWarrantyReview = order.serviceMode === "Warranty" && order.status === "TechnicalQueue";
  const physicalDecision = order.serviceMode === "Warranty" && order.status === "WarrantyReview";
  const repairRouting = order.serviceMode === "Warranty" && order.status === "WarrantyApproved";
  const partsRequest = order.status === "AwaitingParts" && !workflow.partsRequest;
  const repairCompletion = order.status === "InRepair";

  return <div className="order-detail"><section className="panel"><div className="order-summary"><div><h2>{order.displayNumber}</h2><p>{order.branchCode} · {order.serviceMode ?? "—"}</p></div><span className="status-pill">{order.status}</span></div><dl className="order-data"><div><dt>Problema reportado</dt><dd>{order.issueDescription ?? "—"}</dd></div><div><dt>Observación recepción</dt><dd>{order.observation ?? "—"}</dd></div><div><dt>Factura</dt><dd>{order.invoiceNumber ?? "—"}</dd></div><div><dt>Creada</dt><dd>{new Date(order.createdAt).toLocaleString("es-EC")}</dd></div></dl></section>{(directDecision || startWarrantyReview || physicalDecision || repairRouting || repairCompletion) && <section className="panel"><h2>{repairCompletion ? "Finalizar reparación" : "Decisión técnica"}</h2><label className="decision-reason">{repairCompletion ? "Conclusión técnica" : "Razón técnica"}<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} placeholder="Describe diagnóstico, evidencia y decisión." /></label>{repairRouting && <label className="check-line"><input type="checkbox" checked={requiresParts} onChange={(event) => setRequiresParts(event.target.checked)} /> Requiere repuestos</label>}{error && <p className="form-error" role="alert">{error}</p>}<div className="actions">{directDecision && <><button className="secondary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/direct-repair-decision`, false)}>Negar reparación</button><button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/direct-repair-decision`, true)}>Aceptar reparación</button></>}{startWarrantyReview && <button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/start-physical-review`)}>Iniciar revisión física</button>}{physicalDecision && <><button className="secondary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/physical-decision`, false)}>Negar garantía</button><button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/physical-decision`, true)}>Aprobar garantía</button></>}{repairRouting && <button className="primary" disabled={saving} onClick={() => void routeRepair()}>{requiresParts ? "Solicitar repuestos" : "Pasar a reparación"}</button>}{repairCompletion && <button className="primary" disabled={saving} onClick={() => void completeRepair()}>Marcar reparada</button>}</div></section>}{partsRequest && <section className="panel"><h2>Solicitud consolidada de repuestos</h2><label className="decision-reason">Notas<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Observaciones para supervisor/bodega." /></label><div className="parts-list">{parts.map((part, index) => <div key={index}><input value={part.description} onChange={(event) => setParts(parts.map((item, position) => position === index ? { ...item, description: event.target.value } : item))} placeholder="Repuesto requerido" /><input type="number" min="1" value={part.quantity} onChange={(event) => setParts(parts.map((item, position) => position === index ? { ...item, quantity: Number(event.target.value) } : item))} aria-label="Cantidad" /></div>)}</div><div className="actions"><button className="secondary" onClick={() => setParts([...parts, { description: "", quantity: 1 }])}>Agregar repuesto</button><button className="primary" disabled={saving} onClick={() => void requestParts()}>Enviar solicitud</button></div></section>}<section className="panel"><h2>Evidencias</h2>{workflow.evidence.length ? <ul className="simple-list">{workflow.evidence.map((item, index) => <li key={`${item.fileName}-${index}`}>{item.type}: {item.fileName}</li>)}</ul> : <p>No hay evidencias adjuntas.</p>}</section><section className="panel"><h2>Historial</h2><ul className="simple-list">{order.history.map((item, index) => <li key={`${item.occurredAt}-${index}`}><strong>{item.to}</strong> · {item.reason} <small>{new Date(item.occurredAt).toLocaleString("es-EC")}</small></li>)}</ul></section></div>;
}
