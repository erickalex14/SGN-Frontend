"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  const [customerSearch, setCustomerSearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [receptionPhotos, setReceptionPhotos] = useState<File[]>([]);
  const [invoicePdf, setInvoicePdf] = useState<File | null>(null);
  const [customerModal, setCustomerModal] = useState(false);
  const [equipmentModal, setEquipmentModal] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const operationKey = useRef(crypto.randomUUID());
  const warranty = classification === "FinalCustomer" || classification === "Wholesale";

  useEffect(() => {
    void Promise.all([api<Customer[]>("/api/customers?take=100"), api<Branch[]>("/api/branches")])
      .then(([customerItems, branchItems]) => { setCustomers(customerItems); setBranches(branchItems); })
      .catch(() => setMessage("No se pudieron cargar catálogos."));
  }, []);
  useEffect(() => {
    if (!customerId) { setEquipment([]); return; }
    void api<Equipment[]>(`/api/equipment?customerId=${customerId}&take=100`).then(setEquipment).catch(() => setMessage("No se pudieron cargar equipos."));
  }, [customerId]);

  async function createCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true); setMessage("");
    try {
      const item = await api<Customer>("/api/customers", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ identification: form.get("identification"), firstName: form.get("firstName"), lastName: form.get("lastName"), category: "Individual", phone: form.get("phone") || null, email: form.get("email") || null, address: form.get("address") || null }) });
      setCustomers((current) => [...current, item]); setCustomerId(item.id); setEquipmentId(""); setCustomerModal(false); setMessage("Cliente creado y seleccionado.");
    } catch (exception) { setMessage(exception instanceof ApiError ? exception.message : "No fue posible crear el cliente."); }
    finally { setSaving(false); }
  }

  async function createEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!customerId) return; const form = new FormData(event.currentTarget); setSaving(true); setMessage("");
    try {
      const item = await api<Equipment>("/api/equipment", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ customerId, description: form.get("description"), brand: form.get("brand") || null, deviceType: form.get("deviceType") || null, serialNumbers: String(form.get("serials") || "").split(",").map((value) => value.trim()).filter(Boolean) }) });
      setEquipment((current) => [...current, item]); setEquipmentId(item.id); setEquipmentModal(false); setMessage("Equipo creado y seleccionado.");
    } catch (exception) { setMessage(exception instanceof ApiError ? exception.message : "No fue posible crear el equipo."); }
    finally { setSaving(false); }
  }

  async function uploadEvidence(orderId: string, type: string, file: File, key: string) {
    const data = new FormData(); data.append("type", type); data.append("file", file);
    await api(`/api/orders/${orderId}/evidence`, { method: "POST", headers: { "Idempotency-Key": key }, body: data });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    if (!customerId || !branchId || !equipmentId || receptionPhotos.length === 0) { setMessage("Cliente, sucursal, equipo y al menos una foto son obligatorios."); return; }
    if (warranty && !invoicePdf) { setMessage("La garantía requiere factura PDF."); return; }
    setSaving(true); setMessage("");
    try {
      const order = pendingOrderId ? { id: pendingOrderId } : await api<{ id: string }>("/api/orders", { method: "POST", headers: { "Idempotency-Key": `${operationKey.current}:order` }, body: JSON.stringify({ customerId, branchId, equipmentId, assignedTechnicianId: null, originServiceCenterId: null, priority: "Normal", intakeType: warranty ? "WarrantyValidation" : classification === "ExternalCustomer" ? "ExternalCustomerService" : "TechnicalService", issueDescription: form.get("issueDescription"), observation: form.get("observation") || null, invoiceNumber: form.get("invoiceNumber") || null, secondaryInvoiceNumber: null, customerBranchNumber: null, promisedDate: form.get("promisedDate") || null, warrantyKind: warranty ? "Internal" : null, warrantyProvider: null, invoiceDate: form.get("invoiceDate") || null, createdBy: "", queuePriority: classification, serviceMode: warranty ? "Warranty" : "DirectRepair" }) });
      setPendingOrderId(order.id);
      for (const [index, photo] of receptionPhotos.entries()) await uploadEvidence(order.id, "ReceptionPhoto", photo, `${operationKey.current}:photo:${index}`);
      if (invoicePdf) await uploadEvidence(order.id, "InvoicePdf", invoicePdf, `${operationKey.current}:invoice`);
      if (!warranty) await api(`/api/orders/${order.id}/intake/submit`, { method: "POST", headers: { "Idempotency-Key": `${operationKey.current}:submit` } });
      event.currentTarget.reset(); setCustomerId(""); setEquipmentId(""); setReceptionPhotos([]); setInvoicePdf(null); setPendingOrderId(null); operationKey.current = crypto.randomUUID();
      setMessage(warranty ? "Orden creada; pendiente de autorización documental." : "Orden creada y enviada a la cola técnica.");
    } catch (exception) { setMessage(`${exception instanceof ApiError ? exception.message : "No fue posible completar la orden."} Puedes reintentar sin duplicarla.`); }
    finally { setSaving(false); }
  }

  const filteredCustomers = customers.filter((item) => `${item.identification} ${item.firstName} ${item.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()));
  const filteredEquipment = equipment.filter((item) => `${item.description} ${item.brand ?? ""} ${item.serialNumbers.join(" ")}`.toLowerCase().includes(equipmentSearch.toLowerCase()));
  return <><section className="legacy-module"><form className="legacy-order-form" onSubmit={submit}><header className="legacy-form-title"><h2><i className="bi bi-clipboard-plus" /> Nueva Orden de Servicio</h2><p>Complete todos los campos requeridos para registrar el ingreso.</p></header>{message && <p className="legacy-api-note">{message}</p>}<FormSection icon="bi-clipboard-check" title="Tipo de ingreso"><div className="legacy-classifications">{classifications.map(([value, label, detail, tone]) => <label key={value} className={`legacy-classification ${tone} ${classification === value ? "selected" : ""}`}><input type="radio" checked={classification === value} onChange={() => setClassification(value)} /><strong>{label}</strong><small>{detail}</small></label>)}</div></FormSection><FormSection icon="bi-person-vcard" title="Cliente y recepción"><div className="legacy-field-grid two"><Field label="Buscar cliente"><input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Cédula, RUC o nombre" /><select value={customerId} onChange={(event) => { setCustomerId(event.target.value); setEquipmentId(""); }} required><option value="">-- Seleccione cliente --</option>{filteredCustomers.map((item) => <option key={item.id} value={item.id}>{item.identification} · {item.firstName} {item.lastName}</option>)}</select><button type="button" className="legacy-inline-add" onClick={() => setCustomerModal(true)}>+ Nuevo cliente</button></Field><Field label="Sucursal de recepción"><select value={branchId} onChange={(event) => setBranchId(event.target.value)} required><option value="">-- Seleccione sucursal --</option>{branches.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></Field></div></FormSection><FormSection icon="bi-hdd" title="Datos del equipo"><div className="legacy-field-grid three"><Field label="Equipo"><input value={equipmentSearch} onChange={(event) => setEquipmentSearch(event.target.value)} placeholder="Descripción, marca o serie" /><select value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)} required disabled={!customerId}><option value="">-- Seleccione equipo --</option>{filteredEquipment.map((item) => <option key={item.id} value={item.id}>{item.description}{item.brand ? ` · ${item.brand}` : ""}</option>)}</select><button type="button" className="legacy-inline-add" disabled={!customerId} onClick={() => setEquipmentModal(true)}>+ Nuevo equipo</button></Field><Field label="Factura"><input name="invoiceNumber" placeholder="Número de factura" /></Field><Field label="Fecha de factura"><input name="invoiceDate" type="date" /></Field></div></FormSection><FormSection icon="bi-tools" title="Detalle del servicio"><div className="legacy-field-grid two"><Field label="Modo de servicio"><div className="legacy-readonly">{warranty ? "Garantía" : "Reparación directa"}</div></Field><Field label="Fecha comprometida"><input name="promisedDate" type="date" /></Field><Field label="Falla reportada" wide><textarea name="issueDescription" rows={4} required /></Field><Field label="Observaciones de recepción" wide><textarea name="observation" rows={3} /></Field></div></FormSection><FormSection icon="bi-paperclip" title="Evidencias"><div className="legacy-field-grid two"><Field label="Fotos de recepción"><input type="file" accept="image/*" multiple required onChange={(event) => setReceptionPhotos(Array.from(event.target.files ?? []))} /><small>{receptionPhotos.length} foto(s) seleccionada(s)</small></Field>{warranty && <Field label="Factura PDF"><input type="file" accept="application/pdf" required onChange={(event) => setInvoicePdf(event.target.files?.[0] ?? null)} /></Field>}</div></FormSection><div className="legacy-form-actions"><button type="reset" className="legacy-cancel">Limpiar</button><button className="legacy-save" disabled={saving}>{saving ? "Guardando…" : "Guardar orden"}</button></div></form></section>{customerModal && <Modal title="Nuevo cliente" close={() => setCustomerModal(false)}><form className="legacy-quick-form" onSubmit={createCustomer}><input name="identification" required placeholder="Identificación" /><input name="firstName" required placeholder="Nombres" /><input name="lastName" required placeholder="Apellidos" /><input name="phone" placeholder="Teléfono" /><input name="email" type="email" placeholder="Correo" /><input name="address" placeholder="Dirección" /><button disabled={saving}>Crear cliente</button></form></Modal>}{equipmentModal && <Modal title="Nuevo equipo" close={() => setEquipmentModal(false)}><form className="legacy-quick-form" onSubmit={createEquipment}><input name="description" required placeholder="Descripción" /><input name="brand" placeholder="Marca" /><input name="deviceType" placeholder="Tipo" /><input name="serials" placeholder="Series separadas por coma" /><button disabled={saving}>Crear equipo</button></form></Modal>}</>;
}

function FormSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) { return <section className="legacy-form-section"><h3><i className={`bi ${icon}`} /> {title}</h3><div>{children}</div></section>; }
function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`legacy-field ${wide ? "wide" : ""}`}><span>{label} <b>*</b></span>{children}</label>; }
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) { return <div className="legacy-modal" role="dialog" aria-modal="true"><section><header><h3>{title}</h3><button type="button" onClick={close}>×</button></header>{children}</section></div>; }
