"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { statusOrder, statusLabels, statusClass, priorityLabels, priorityClass } from "@/lib/order-status";
import "./legacy-order-search.css";

type CurrentOrder = { id: string; displayNumber: string; branchCode: string; status: string; serviceMode: string | null; createdAt: string; invoiceNumber: string | null };
type LegacyOrder = { id: number; number: string; status: string; intakeReason: string | null; invoiceNumber: string | null; receivedAt: string | null; observation: string | null };
type Lookup = { source: "new" | "legacy"; readOnly: boolean; newOrder: CurrentOrder | null; legacyOrder: LegacyOrder | null };

type OrderItem = { id: string; customerId: string | null; branchId: string | null; displayNumber: string; branchCode: string; priority: string | null; queuePriority: string | null; serviceMode: string | null; status: string; createdAt: string };
type OrderList = { page: number; pageSize: number; total: number; items: OrderItem[] };
type Customer = { id: string; identification: string; firstName: string; lastName: string };
type Branch = { id: string; code: string; name: string };

export function LegacyOrderSearch() {
  const [number, setNumber] = useState(""); const [result, setResult] = useState<Lookup | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [text, setText] = useState("");
  const [list, setList] = useState<OrderItem[]>([]);
  const [listTotal, setListTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  async function searchLookup(event: FormEvent) {
    event.preventDefault(); if (!number.trim()) return; setLoading(true); setError(""); setResult(null);
    try { setResult(await api<Lookup>(`/api/orders/lookup/${encodeURIComponent(number.trim())}`)); }
    catch (e) { setError(e instanceof ApiError && e.status === 404 ? "No encontramos esa orden en SGN nuevo ni en el histórico legacy." : "No se pudo realizar la búsqueda."); }
    finally { setLoading(false); }
  }
  const order = result?.newOrder ?? result?.legacyOrder;

  useEffect(() => {
    void Promise.all([api<Customer[]>("/api/customers?take=200"), api<Branch[]>("/api/branches")])
      .then(([c, b]) => { setCustomers(c); setBranches(b); })
      .catch(() => undefined);
  }, []);

  const loadList = useCallback(async () => {
    setListLoading(true); setListError("");
    try {
      const params = new URLSearchParams({ pageSize: "100" });
      if (status) params.set("status", status);
      if (customerId) params.set("customerId", customerId);
      if (branchId) params.set("branchId", branchId);
      const data = await api<OrderList>(`/api/orders?${params.toString()}`);
      setList(data.items); setListTotal(data.total);
    } catch (e) {
      setListError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene el permiso ordenes_buscar/ver." : "No se pudo cargar el listado de órdenes.");
    } finally { setListLoading(false); }
  }, [status, customerId, branchId]);
  useEffect(() => { void loadList(); }, [loadList]);

  const customerName = useMemo(() => {
    const map = new Map(customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`.trim() || c.identification]));
    return (id: string | null) => (id ? map.get(id) ?? "—" : "—");
  }, [customers]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return list;
    return list.filter((o) => `${o.displayNumber} ${o.branchCode} ${statusLabels[o.status] ?? o.status} ${customerName(o.customerId)}`.toLowerCase().includes(q));
  }, [list, text, customerName]);

  function clearFilters() { setStatus(""); setCustomerId(""); setBranchId(""); setText(""); }

  return <section className="bo-wrap">
    <header className="bo-header"><h2><i className="bi bi-search" /> Buscar órdenes</h2><p>Consulta una orden puntual por número (incluye histórico legacy) o filtra el listado de órdenes nuevas.</p></header>

    <form className="bo-panel" onSubmit={searchLookup}>
      <label>NÚMERO DE ORDEN<div><i className="bi bi-hash" /><input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Ej.: UIO-1001" /></div></label>
      <button disabled={loading}>{loading ? "Buscando…" : <><i className="bi bi-search" /> Buscar orden</>}</button>
      <button type="button" className="bo-reset" onClick={() => { setNumber(""); setResult(null); setError(""); }}><i className="bi bi-x-circle" /> Limpiar</button>
    </form>
    {error && <p className="bo-error">{error}</p>}
    {order && <article className="bo-card"><div className="bo-card-top"><strong>{"displayNumber" in order ? order.displayNumber : order.number}</strong><span className={result?.readOnly ? "legacy" : "new"}>{result?.readOnly ? "Histórico legacy · solo lectura" : "SGN nuevo"}</span></div><dl><div><dt>Estado</dt><dd>{"displayNumber" in order ? statusLabels[order.status] ?? order.status : order.status}</dd></div><div><dt>Factura</dt><dd>{order.invoiceNumber || "—"}</dd></div><div><dt>{result?.readOnly ? "Motivo de ingreso" : "Servicio"}</dt><dd>{"serviceMode" in order ? order.serviceMode || "—" : order.intakeReason || "—"}</dd></div><div><dt>{result?.readOnly ? "Fecha de recepción" : "Sucursal"}</dt><dd>{"branchCode" in order ? order.branchCode : order.receivedAt ? new Date(order.receivedAt).toLocaleDateString("es-EC") : "—"}</dd></div></dl>{result?.newOrder ? <Link href={`/operaciones/ordenes/${result.newOrder.id}`}><i className="bi bi-eye" /> Abrir detalle y flujo</Link> : <p className="bo-readonly"><i className="bi bi-lock" /> Esta orden pertenece al sistema anterior; se consulta sin modificarla.</p>}</article>}

    <div className="bo-section">
      <h3 className="bo-section-title"><i className="bi bi-list-ul" /> Listado de órdenes</h3>
      <div className="bo-list-panel">
        <div className="bo-filtros-grid">
          <div className="campo"><label>Buscar en resultados</label><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nro. orden, sucursal, cliente o estado…" /></div>
          <div className="campo"><label>Estado</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">— Todos —</option>{statusOrder.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>
          <div className="campo"><label>Cliente</label><select value={customerId} onChange={(e) => setCustomerId(e.target.value)}><option value="">— Todos —</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.identification} · {c.firstName} {c.lastName}</option>)}</select></div>
          <div className="campo"><label>Sucursal</label><select value={branchId} onChange={(e) => setBranchId(e.target.value)}><option value="">— Todas —</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.code} · {b.name}</option>)}</select></div>
          <button type="button" className="bo-list-clear" onClick={clearFilters}><i className="bi bi-x-lg" /> Limpiar</button>
        </div>

        <div className="bo-res-header"><div className="bo-res-count"><span>{listLoading ? "…" : visible.length}</span> de {listTotal} orden(es)</div></div>
        {listError && <p className="bo-error">{listError}</p>}
        {listLoading ? <div className="bo-list-empty">Cargando órdenes…</div>
          : visible.length === 0 ? <div className="bo-list-empty">No hay órdenes que coincidan con los filtros.</div>
          : <div className="bo-grid-resultados">{visible.map((o) => <Link className="bo-card-orden" key={o.id} href={`/operaciones/ordenes/${o.id}`}>
              <div className="bo-card-top"><div className="bo-nro">{o.displayNumber}</div>{o.serviceMode && <span className="bo-tipo-pill">{o.serviceMode === "Warranty" ? "Garantía" : "Reparación"}</span>}</div>
              <div className="bo-badges"><span className={`bo-badge ${statusClass[o.status] ?? "st-otro"}`}>{statusLabels[o.status] ?? o.status}</span>{o.queuePriority && <span className={`bo-priority ${priorityClass[o.queuePriority] ?? ""}`}>{priorityLabels[o.queuePriority] ?? o.queuePriority}</span>}</div>
              <div className="bo-card-info">
                <div><div className="bo-field-lbl">Cliente</div><div className="bo-field-val">{customerName(o.customerId)}</div></div>
                <div><div className="bo-field-lbl">Sucursal</div><div className="bo-field-val">{o.branchCode}</div></div>
                <div><div className="bo-field-lbl">Ingreso</div><div className="bo-field-val">{new Date(o.createdAt).toLocaleDateString("es-EC")}</div></div>
                <div><div className="bo-field-lbl">Servicio</div><div className="bo-field-val">{o.serviceMode === "Warranty" ? "Garantía" : o.serviceMode === "DirectRepair" ? "Reparación directa" : "—"}</div></div>
              </div>
              <i className="bi bi-chevron-right bo-card-icon" />
            </Link>)}</div>}
      </div>
    </div>
  </section>;
}
