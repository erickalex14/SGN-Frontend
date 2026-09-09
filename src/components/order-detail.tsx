"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, apiDownload, ApiError } from "@/lib/api";
import { getSession } from "@/lib/session";
import { equipmentConditions } from "@/components/informes-pages";
import "./order-detail.css";

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
type Quote = { id: string; amount: number; currency: string; status: string; notes: string | null };
type PartsRequest = { status: string; notes: string | null; items: { description: string; quantity: number }[] };
type TechReport = { id: string; equipmentCondition: string; reportDate: string; background: string | null; process: string | null; conclusion: string | null; recommendations: string | null };
type Workflow = { order: Order; evidence: { id: string; type: string; fileName: string; createdAt: string }[]; partsRequest: PartsRequest | null; quotes: Quote[]; reports: TechReport[] };
type PartItem = { description: string; quantity: number };

export function OrderDetail({ orderId }: { orderId: string }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [requiresParts, setRequiresParts] = useState(false);
  const [parts, setParts] = useState<PartItem[]>([{ description: "", quantity: 1 }]);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [requiresQuoteParts, setRequiresQuoteParts] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null);
  const [deliveryMemo, setDeliveryMemo] = useState<File | null>(null);
  const [downloadingEvidenceId, setDownloadingEvidenceId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

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

  async function submitQuote(accept = true) {
    const pendingQuote = workflow?.quotes.find((quote) => quote.status === "Pending");
    if (pendingQuote) {
      if (!reason.trim()) { setError("Registra decisión del cliente."); return; }
      setSaving(true); setError("");
      try {
        await api(`/api/orders/${orderId}/quotes/${pendingQuote.id}/decision`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ decision: accept ? "Accepted" : "Rejected", requiresParts: accept && requiresQuoteParts, reason }) });
        setReason(""); await load();
      } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible registrar decisión."); }
      finally { setSaving(false); }
      return;
    }
    if (!Number(quoteAmount) || Number(quoteAmount) <= 0) { setError("Ingresa valor de cotización válido."); return; }
    setSaving(true); setError("");
    try {
      await api(`/api/orders/${orderId}/quotes`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ amount: Number(quoteAmount), currency: "USD", notes: reason || null }) });
      setQuoteAmount(""); setReason(""); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible crear cotización."); }
    finally { setSaving(false); }
  }

  async function uploadEvidence(type: "DeliveryPhoto" | "DeliveryMemo", file: File) {
    const data = new FormData(); data.append("type", type); data.append("file", file);
    await api(`/api/orders/${orderId}/evidence`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: data });
  }

  async function downloadEvidence(evidence: Workflow["evidence"][number]) {
    setDownloadingEvidenceId(evidence.id); setError("");
    try {
      const result = await apiDownload(`/api/orders/${orderId}/evidence/${evidence.id}/download`);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url; link.download = result.fileName ?? evidence.fileName;
      document.body.appendChild(link); link.click(); link.remove();
      URL.revokeObjectURL(url);
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible descargar la evidencia."); }
    finally { setDownloadingEvidenceId(null); }
  }

  async function closeDelivery() {
    setSaving(true); setError("");
    try {
      if (deliveryPhoto) await uploadEvidence("DeliveryPhoto", deliveryPhoto);
      if (deliveryMemo) await uploadEvidence("DeliveryMemo", deliveryMemo);
      const endpoint = workflow?.order.status === "NotRepaired" ? "no-repair-closure" : "";
      await api(`/api/orders/${orderId}/delivery${endpoint ? `/${endpoint}` : ""}`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } });
      setDeliveryPhoto(null); setDeliveryMemo(null); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible cerrar entrega."); }
    finally { setSaving(false); }
  }

  async function requestCreditNote() {
    if (!reason.trim()) { setError("Indica razón para solicitar Nota de Crédito."); return; }
    setSaving(true); setError("");
    try {
      await api(`/api/orders/${orderId}/credit-note-request`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ reason }) });
      setReason(""); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible solicitar Nota de Crédito."); }
    finally { setSaving(false); }
  }

  async function createReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const background = String(form.get("background") ?? "").trim();
    const process = String(form.get("process") ?? "").trim();
    if (!background || !process) { setError("Antecedentes y proceso del informe son obligatorios."); return; }
    setSaving(true); setError("");
    try {
      await api(`/api/orders/${orderId}/reports`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ authorId: "", background, process, conclusion: form.get("conclusion") || null, recommendations: form.get("recommendations") || null, equipmentCondition: form.get("equipmentCondition"), reportDate: null, budgetJson: null }) });
      setReportOpen(false); await load();
    } catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible guardar el informe."); }
    finally { setSaving(false); }
  }

  async function decideParts(decision: "Dispatched" | "LocalPurchase" | "ImportPending" | "NoSolution") {
    if (!reason.trim()) { setError("Indica la decisión y su justificación."); return; }
    setSaving(true); setError("");
    try { await api(`/api/orders/${orderId}/parts-request/decision`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ decision, reason }) }); setReason(""); await load(); }
    catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible resolver la solicitud de repuestos."); }
    finally { setSaving(false); }
  }

  async function decideCreditNote(approved: boolean) {
    if (!reason.trim()) { setError("Indica la decisión y su justificación."); return; }
    setSaving(true); setError("");
    try { await api(`/api/orders/${orderId}/credit-note-request/decision`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ decision: approved ? "Approved" : "Rejected", reason }) }); setReason(""); await load(); }
    catch (exception) { setError(exception instanceof ApiError ? exception.message : "No fue posible decidir la Nota de Crédito."); }
    finally { setSaving(false); }
  }

  if (loading) return <section className="od-root panel no-data">Cargando orden…</section>;
  if (!workflow) return <section className="od-root panel form-error">{error || "Orden no encontrada."}</section>;
  const { order } = workflow;
  const documentaryDecision = order.serviceMode === "Warranty" && order.status === "Pending";
  const directDecision = order.serviceMode === "DirectRepair" && order.status === "TechnicalQueue";
  const startWarrantyReview = order.serviceMode === "Warranty" && order.status === "TechnicalQueue";
  const physicalDecision = order.serviceMode === "Warranty" && order.status === "WarrantyReview";
  const repairRouting = order.serviceMode === "Warranty" && order.status === "WarrantyApproved";
  const partsRequest = order.status === "AwaitingParts" && !workflow.partsRequest;
  const repairCompletion = order.status === "InRepair";
  const quotePending = order.status === "QuotePending";
  const delivery = order.status === "AwaitingDelivery" || order.status === "NotRepaired";
  const canRequestCreditNote = getSession()?.affiliation !== "AuthorizedServiceCenter" && order.status === "AwaitingParts" && Boolean(workflow.partsRequest);
  const partsDecision = order.status === "AwaitingParts" && workflow.partsRequest?.status === "Requested";
  const creditNoteDecision = order.status === "CreditNotePending";

  return <div className="od-root order-detail"><section className="panel"><div className="order-summary"><div><h2>{order.displayNumber}</h2><p>{order.branchCode} · {order.serviceMode ?? "—"}</p></div><span className="status-pill">{order.status}</span></div><dl className="order-data"><div><dt>Problema reportado</dt><dd>{order.issueDescription ?? "—"}</dd></div><div><dt>Observación recepción</dt><dd>{order.observation ?? "—"}</dd></div><div><dt>Factura</dt><dd>{order.invoiceNumber ?? "—"}</dd></div><div><dt>Creada</dt><dd>{new Date(order.createdAt).toLocaleString("es-EC")}</dd></div></dl></section>{(documentaryDecision || directDecision || startWarrantyReview || physicalDecision || repairRouting || repairCompletion) && <section className="panel"><h2>{documentaryDecision ? "Autorización documental de garantía" : repairCompletion ? "Finalizar reparación" : "Decisión técnica"}</h2>{documentaryDecision && <p>Verifica factura y evidencias de recepción antes de enviar la orden a cola técnica.</p>}<label className="decision-reason">{repairCompletion ? "Conclusión técnica" : documentaryDecision ? "Observación de autorización" : "Razón técnica"}<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} placeholder="Describe diagnóstico, evidencia y decisión." /></label>{repairRouting && <label className="check-line"><input type="checkbox" checked={requiresParts} onChange={(event) => setRequiresParts(event.target.checked)} /> Requiere repuestos</label>}{error && <p className="form-error" role="alert">{error}</p>}<div className="actions">{documentaryDecision && <><button className="secondary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/documentary-decision`, false)}>Negar por fecha</button><button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/documentary-decision`, true)}>Aprobar y enviar a cola</button></>}{directDecision && <><button className="secondary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/direct-repair-decision`, false)}>Negar reparación</button><button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/direct-repair-decision`, true)}>Aceptar reparación</button></>}{startWarrantyReview && <button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/start-physical-review`)}>Iniciar revisión física</button>}{physicalDecision && <><button className="secondary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/physical-decision`, false)}>Negar garantía</button><button className="primary" disabled={saving} onClick={() => void decide(`/api/orders/${order.id}/warranty/physical-decision`, true)}>Aprobar garantía</button></>}{repairRouting && <button className="primary" disabled={saving} onClick={() => void routeRepair()}>{requiresParts ? "Solicitar repuestos" : "Pasar a reparación"}</button>}{repairCompletion && <button className="primary" disabled={saving} onClick={() => void completeRepair()}>Marcar reparada</button>}</div></section>}{partsRequest && <section className="panel"><h2>Solicitud consolidada de repuestos</h2><label className="decision-reason">Notas<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Observaciones para supervisor/bodega." /></label><div className="parts-list">{parts.map((part, index) => <div key={index}><input value={part.description} onChange={(event) => setParts(parts.map((item, position) => position === index ? { ...item, description: event.target.value } : item))} placeholder="Repuesto requerido" /><input type="number" min="1" value={part.quantity} onChange={(event) => setParts(parts.map((item, position) => position === index ? { ...item, quantity: Number(event.target.value) } : item))} aria-label="Cantidad" /></div>)}</div><div className="actions"><button className="secondary" onClick={() => setParts([...parts, { description: "", quantity: 1 }])}>Agregar repuesto</button><button className="primary" disabled={saving} onClick={() => void requestParts()}>Enviar solicitud</button></div></section>}{partsDecision && <section className="panel"><h2>Resolver solicitud de repuestos</h2><p>Solicitud consolidada: {workflow.partsRequest?.items.map((item) => `${item.quantity}× ${item.description}`).join(", ")}</p><label className="decision-reason">Decisión / observación<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Indica despacho, compra local, importación o que no existe solución." /></label><div className="actions"><button className="primary" disabled={saving} onClick={() => void decideParts("Dispatched")}>Despachar</button><button className="secondary" disabled={saving} onClick={() => void decideParts("LocalPurchase")}>Compra local</button><button className="secondary" disabled={saving} onClick={() => void decideParts("ImportPending")}>Importación</button><button className="secondary" disabled={saving} onClick={() => void decideParts("NoSolution")}>Sin solución</button></div></section>}{creditNoteDecision && <section className="panel"><h2>Autorizar Nota de Crédito</h2><label className="decision-reason">Decisión / justificación<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Indica si procede la Nota de Crédito." /></label><div className="actions"><button className="secondary" disabled={saving} onClick={() => void decideCreditNote(false)}>Rechazar NC</button><button className="primary" disabled={saving} onClick={() => void decideCreditNote(true)}>Aprobar NC</button></div></section>}{quotePending && <section className="panel"><h2>Cotización de reparación</h2>{workflow.quotes.find((quote) => quote.status === "Pending") ? <><p>Confirma la respuesta del cliente para cotización pendiente.</p><label className="decision-reason">Respuesta del cliente<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} /></label><label className="check-line"><input type="checkbox" checked={requiresQuoteParts} onChange={(event) => setRequiresQuoteParts(event.target.checked)} /> Requiere repuestos</label><div className="actions"><button className="secondary" disabled={saving} onClick={() => void submitQuote(false)}>Cliente no acepta</button><button className="primary" disabled={saving} onClick={() => void submitQuote()}>Cliente acepta</button></div></> : <><label className="decision-reason">Valor USD<input type="number" min="0.01" step="0.01" value={quoteAmount} onChange={(event) => setQuoteAmount(event.target.value)} /></label><label className="decision-reason">Notas<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} /></label><div className="actions"><button className="primary" disabled={saving} onClick={() => void submitQuote()}>Crear cotización</button></div></>}</section>}{delivery && <section className="panel"><h2>{order.status === "NotRepaired" ? "Devolver equipo no reparado" : "Entrega de equipo"}</h2><p>Adjunta foto y memo de entrega antes de cerrar.</p><label className="decision-reason">Foto de entrega<input type="file" accept="image/*" onChange={(event) => setDeliveryPhoto(event.target.files?.[0] ?? null)} /></label><label className="decision-reason">Memo de entrega<input type="file" accept=".pdf,image/*" onChange={(event) => setDeliveryMemo(event.target.files?.[0] ?? null)} /></label><div className="actions"><button className="primary" disabled={saving} onClick={() => void closeDelivery()}>Cerrar orden</button></div></section>}{canRequestCreditNote && <section className="panel"><h2>Solicitud de Nota de Crédito</h2><label className="decision-reason">Justificación<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} /></label><div className="actions"><button className="secondary" disabled={saving} onClick={() => void requestCreditNote()}>Solicitar NC</button></div></section>}<section className="panel"><h2>Informes técnicos</h2>{workflow.reports.length ? <ul className="simple-list">{workflow.reports.map((report) => <li key={report.id}><strong>{report.equipmentCondition}</strong> · {new Date(report.reportDate).toLocaleDateString("es-EC")}<div style={{ marginTop: 6, color: "#475569", whiteSpace: "pre-wrap" }}>{report.conclusion || report.process || report.background || "—"}</div></li>)}</ul> : <p>No hay informes técnicos.</p>}{reportOpen ? <form onSubmit={createReport} style={{ marginTop: 12, display: "grid", gap: 10 }}><label className="decision-reason">Antecedentes<textarea name="background" rows={3} /></label><label className="decision-reason">Proceso<textarea name="process" rows={3} /></label><label className="decision-reason">Conclusión<textarea name="conclusion" rows={2} /></label><label className="decision-reason">Recomendaciones<textarea name="recommendations" rows={2} /></label><label className="decision-reason">Estado del equipo<select name="equipmentCondition" defaultValue={equipmentConditions[0]}>{equipmentConditions.map((condition) => <option key={condition}>{condition}</option>)}</select></label><div className="actions"><button type="button" className="secondary" onClick={() => setReportOpen(false)}>Cancelar</button><button className="primary" disabled={saving}>Guardar informe</button></div></form> : <div className="actions"><button className="secondary" onClick={() => setReportOpen(true)}>Crear informe técnico</button></div>}</section><section className="panel"><h2>Evidencias</h2>{workflow.evidence.length ? <ul className="simple-list evidence-list">{workflow.evidence.map((item) => <li key={item.id}><span><strong>{item.type}</strong><small>{item.fileName}</small></span><button type="button" disabled={downloadingEvidenceId === item.id} onClick={() => void downloadEvidence(item)}>{downloadingEvidenceId === item.id ? "Descargando…" : "Descargar"}</button></li>)}</ul> : <p>No hay evidencias adjuntas.</p>}</section><section className="panel"><h2>Historial</h2><ul className="simple-list">{order.history.map((item, index) => <li key={`${item.occurredAt}-${index}`}><strong>{item.to}</strong> · {item.reason} <small>{new Date(item.occurredAt).toLocaleString("es-EC")}</small></li>)}</ul></section></div>;
}
