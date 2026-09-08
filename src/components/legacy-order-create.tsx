"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./legacy-order-create.css";

const classifications = [
  ["FinalCustomer", "Cliente final", "Prioridad 1 · Garantía", "green"],
  ["Wholesale", "Mayorista", "Prioridad 2 · Garantía", "yellow"],
  ["ExternalCustomer", "Cliente externo", "Prioridad 3 · Reparación directa", "teal"],
  ["Stock", "Stock", "Prioridad 4 · Reparación directa", "red"],
  ["SelfConsumption", "Autoconsumo", "Prioridad 5 · Reparación directa", "white"],
] as const;

type Customer = { id: string; identification: string; firstName: string; lastName: string };
type Branch = { id: string; code: string; name: string };
type Equipment = { id: string; description: string; brand: string | null; serialNumbers: string[] };

export function LegacyOrderCreate() {
  const [classification, setClassification] = useState("FinalCustomer");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [receptionPhoto, setReceptionPhoto] = useState<File | null>(null);
  const [invoicePdf, setInvoicePdf] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const warranty = classification === "FinalCustomer" || classification === "Wholesale";
  useEffect(() => { void Promise.all([api<Customer[]>("/api/customers?take=100"), api<Branch[]>("/api/branches")]).then(([loadedCustomers, loadedBranches]) => { setCustomers(loadedCustomers); setBranches(loadedBranches); }).catch(() => setMessage("No se pudieron cargar catálogos.")); }, []);
  useEffect(() => { if (!customerId) { setEquipment([]); return; } void api<Equipment[]>(`/api/equipment?customerId=${customerId}&take=100`).then(setEquipment).catch(() => setMessage("No se pudieron cargar equipos.")); }, [customerId]);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); if (!customerId || !branchId || !equipmentId || !receptionPhoto) { setMessage("Cliente, sucursal, equipo y foto de recepción son obligatorios."); return; } if (warranty && !invoicePdf) { setMessage("Garantía requiere factura PDF."); return; } setSaving(true); setMessage(""); try { const order = await api<{ id: string }>("/api/orders", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ customerId, branchId, equipmentId, assignedTechnicianId: null, originServiceCenterId: null, priority: "Normal", intakeType: warranty ? "WarrantyValidation" : classification === "ExternalCustomer" ? "ExternalCustomerService" : "TechnicalService", issueDescription: form.get("issueDescription"), observation: form.get("observation") || null, invoiceNumber: form.get("invoiceNumber") || null, secondaryInvoiceNumber: null, customerBranchNumber: null, promisedDate: form.get("promisedDate") || null, warrantyKind: warranty ? "Internal" : null, warrantyProvider: null, invoiceDate: form.get("invoiceDate") || null, createdBy: "", queuePriority: classification, serviceMode: warranty ? "Warranty" : "DirectRepair" }) }); for (const [type, file] of [["ReceptionPhoto", receptionPhoto], ["InvoicePdf", invoicePdf]] as const) { if (!file) continue; const data = new FormData(); data.append("type", type); data.append("file", file); await api(`/api/orders/${order.id}/evidence`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: data }); } if (!warranty) await api(`/api/orders/${order.id}/intake/submit`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } }); setMessage(warranty ? "Orden creada. Queda pendiente de autorización documental." : "Orden creada y enviada al flujo técnico."); event.currentTarget.reset(); setCustomerId(""); setEquipmentId(""); } catch (exception) { setMessage(exception instanceof ApiError ? exception.message : "No fue posible crear la orden."); } finally { setSaving(false); } }
  return <section className="legacy-module"><form className="legacy-order-form" onSubmit={submit}><header className="legacy-form-title"><h2><i className="bi bi-clipboard-plus" /> Nueva Orden de Servicio</h2><p>Complete todos los campos requeridos para registrar el ingreso.</p></header>{message && <p className="legacy-api-note">{message}</p>}<FormSection icon="bi-clipboard-check" title="Tipo de ingreso"><div className="legacy-classifications">{classifications.map(([value, label, detail, tone]) => <label key={value} className={`legacy-classification ${tone} ${classification === value ? "selected" : ""}`}><input type="radio" name="classification" value={value} checked={classification === value} onChange={() => setClassification(value)} /><strong>{label}</strong><small>{detail}</small></label>)}</div></FormSection><FormSection icon="bi-person-vcard" title="Datos del cliente"><div className="legacy-field-grid two"><Field label="Cliente"><select value={customerId} onChange={(event) => { setCustomerId(event.target.value); setEquipmentId(""); }} required><option value="">-- Seleccione cliente --</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.identification} · {customer.firstName} {customer.lastName}</option>)}</select></Field><Field label="Sucursal de recepción"><select value={branchId} onChange={(event) => setBranchId(event.target.value)} required><option value="">-- Seleccione sucursal --</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.code} · {branch.name}</option>)}</select></Field></div></FormSection><FormSection icon="bi-hdd" title="Datos del equipo"><div className="legacy-field-grid three"><Field label="Equipo"><select value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)} required disabled={!customerId}><option value="">-- Seleccione equipo --</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.description}{item.brand ? ` · ${item.brand}` : ""}</option>)}</select></Field><Field label="Factura"><input name="invoiceNumber" placeholder="Número de factura" /></Field><Field label="Fecha de factura"><input name="invoiceDate" type="date" /></Field></div></FormSection><FormSection icon="bi-tools" title="Detalle del servicio"><div className="legacy-field-grid two"><Field label="Modo de servicio"><div className="legacy-readonly"><i className={`bi ${warranty ? "bi-shield-check" : "bi-tools"}`} />{warranty ? "Garantía" : "Reparación directa"}</div></Field><Field label="Fecha comprometida"><input name="promisedDate" type="date" /></Field><Field label="Falla reportada" wide><textarea name="issueDescription" rows={4} required placeholder="Describa el problema informado por el cliente..." /></Field><Field label="Observaciones de recepción" wide><textarea name="observation" rows={3} placeholder="Estado físico, accesorios recibidos, observaciones..." /></Field></div></FormSection><FormSection icon="bi-paperclip" title="Evidencias de recepción"><div className="legacy-field-grid two"><Field label="Foto de recepción"><input type="file" accept="image/*" required onChange={(event) => setReceptionPhoto(event.target.files?.[0] ?? null)} /></Field>{warranty && <Field label="Factura PDF"><input type="file" accept="application/pdf" required onChange={(event) => setInvoicePdf(event.target.files?.[0] ?? null)} /></Field>}</div><p className="legacy-help"><i className="bi bi-info-circle" /> Se requerirá foto de recepción{warranty ? " y factura PDF" : ""} antes de enviar la orden al flujo.</p></FormSection><div className="legacy-form-actions"><button type="button" className="legacy-cancel">Cancelar</button><button type="submit" className="legacy-save" disabled={saving}><i className="bi bi-check2-circle" /> {saving ? "Guardando…" : "Guardar orden"}</button></div></form></section>;
}

function FormSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return <section className="legacy-form-section"><h3><i className={`bi ${icon}`} /> {title}</h3><div>{children}</div></section>;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`legacy-field ${wide ? "wide" : ""}`}><span>{label} <b>*</b></span>{children}</label>;
}
