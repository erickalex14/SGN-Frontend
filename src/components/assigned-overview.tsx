"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { statusLabels, statusClass, priorityLabels, priorityClass, statusOrder, statusBuckets } from "@/lib/order-status";
import "./assigned-overview.css";

type OrderItem = { id: string; customerId: string | null; branchId: string | null; displayNumber: string; branchCode: string; queuePriority: string | null; serviceMode: string | null; status: string; createdAt: string };
type Group = { technicianId: string; technicianName: string; active: number; pendiente: number; proceso: number; entrega: number; orders: OrderItem[] };
type Overview = { technicians: Group[] };
type Customer = { id: string; identification: string; firstName: string; lastName: string };

function cargaColor(ratio: number): [string, string] {
  if (ratio < 0.4) return ["#10b981", "Baja"];
  if (ratio < 0.75) return ["#f59e0b", "Media"];
  return ["#ef4444", "Alta"];
}

export function AssignedOverview() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [openTech, setOpenTech] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await api<Overview>("/api/orders/assigned-overview");
      setGroups(data.technicians);
      setOpenTech((current) => current ?? data.technicians[0]?.technicianId ?? null);
    } catch (e) {
      setError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene el permiso ordenes_asignadas/ver." : "No se pudo cargar el resumen de órdenes asignadas.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    void api<Customer[]>("/api/customers?take=200").then(setCustomers).catch(() => undefined);
  }, []);
  const customerName = useMemo(() => {
    const map = new Map(customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`.trim() || c.identification]));
    return (id: string | null) => (id ? map.get(id) ?? "—" : "—");
  }, [customers]);

  const maxCarga = Math.max(1, ...groups.map((g) => g.pendiente + g.proceso));
  const totalActivas = groups.reduce((sum, g) => sum + g.active, 0);
  const totalPendientes = groups.reduce((sum, g) => sum + g.pendiente, 0);
  const totalProceso = groups.reduce((sum, g) => sum + g.proceso, 0);

  const matches = useCallback((o: OrderItem) => {
    const q = text.trim().toLowerCase();
    if (q && !`${o.displayNumber} ${o.branchCode} ${customerName(o.customerId)} ${statusLabels[o.status] ?? o.status}`.toLowerCase().includes(q)) return false;
    if (status && !(statusBuckets[status] ?? [status]).includes(o.status)) return false;
    return true;
  }, [text, status, customerName]);

  return <section className="oa-wrap">
    <div className="oa-head"><h2><i className="bi bi-person-check" /> Órdenes asignadas</h2><p>Agrupadas por técnico y organizadas según su carga actual.</p></div>

    <div className="oa-toolbar">
      <div className="campo"><label>Buscar</label><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nro. orden, cliente, sucursal, estado…" /></div>
      <div className="campo"><label>Estado</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">— Todos —</option><optgroup label="Grupos"><option value="pendiente">Pendiente</option><option value="proceso">En proceso</option><option value="entrega">Listo para entrega</option><option value="nc">Nota de crédito</option></optgroup><optgroup label="Estado exacto">{statusOrder.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</optgroup></select></div>
      <button type="button" onClick={() => { setText(""); setStatus(""); }}><i className="bi bi-x-circle" /> Limpiar</button>
      <button type="button" onClick={() => void load()} disabled={loading}><i className="bi bi-arrow-clockwise" /> Actualizar</button>
    </div>

    <div className="oa-kpis">
      <div className="oa-kpi"><div className="oa-kpi-lbl">Técnicos con carga</div><div className="oa-kpi-val">{groups.length}</div></div>
      <div className="oa-kpi"><div className="oa-kpi-lbl">Órdenes activas</div><div className="oa-kpi-val">{totalActivas}</div></div>
      <div className="oa-kpi"><div className="oa-kpi-lbl">Pendientes</div><div className="oa-kpi-val">{totalPendientes}</div></div>
      <div className="oa-kpi"><div className="oa-kpi-lbl">En proceso</div><div className="oa-kpi-val">{totalProceso}</div></div>
    </div>

    {error && <div className="oa-error">{error}</div>}
    {loading ? <div className="oa-global-empty">Cargando…</div>
      : groups.length === 0 ? <div className="oa-global-empty">No hay órdenes asignadas actualmente.</div>
      : groups.map((g) => {
          const [color, carga] = cargaColor((g.pendiente + g.proceso) / maxCarga);
          const open = openTech === g.technicianId;
          const visibleOrders = g.orders.filter(matches);
          return <div className="oa-tecnico-bloque" key={g.technicianId}>
            <div className="oa-tec-header" onClick={() => setOpenTech(open ? null : g.technicianId)}>
              <div className="oa-tec-avatar" style={{ background: color }}>{(g.technicianName[0] ?? "?").toUpperCase()}</div>
              <span className="oa-tec-nombre">{g.technicianName}</span>
              <div className="oa-tec-badges">
                <span className="oa-badge-asig">{g.active} activas</span>
                <span className="oa-badge-carga" style={{ background: `${color}20`, color, borderColor: `${color}66` }}>{g.pendiente}P · {g.proceso}EP · {carga}</span>
              </div>
              <span className={`oa-chevron ${open ? "open" : ""}`}>▼</span>
            </div>
            {open && <div className="oa-tec-body">
              {visibleOrders.length === 0 ? <div className="oa-empty">Sin órdenes que coincidan con los filtros.</div>
                : <div className="oa-cards-grid">{visibleOrders.map((o) => <Link className="oa-card" key={o.id} href={`/operaciones/ordenes/${o.id}`}>
                    <div className="oa-card-top"><span className="oa-nro">{o.displayNumber}</span><span className={`oa-status ${statusClass[o.status] ?? "st-otro"}`}>{statusLabels[o.status] ?? o.status}</span></div>
                    <div className="oa-cliente"><i className="bi bi-person" /> {customerName(o.customerId)}</div>
                    <div className="oa-equipo"><i className="bi bi-building" /> {o.branchCode} · {o.serviceMode === "Warranty" ? "Garantía" : "Reparación directa"}</div>
                    <div className="oa-meta-row">
                      <span className="oa-meta"><i className="bi bi-calendar3" /> {new Date(o.createdAt).toLocaleDateString("es-EC")}</span>
                      {o.queuePriority && <span className={`oa-priority ${priorityClass[o.queuePriority] ?? ""}`}>{priorityLabels[o.queuePriority] ?? o.queuePriority}</span>}
                    </div>
                  </Link>)}</div>}
            </div>}
          </div>;
        })}
  </section>;
}
