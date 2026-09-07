"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import Link from "next/link";

type Order = {
  id: string;
  displayNumber: string;
  branchCode: string;
  priority: string;
  queuePriority: string | null;
  serviceMode: string | null;
  status: string;
  createdAt: string;
};

type OrderList = { total: number; items: Order[] };

const priorityLabel: Record<string, string> = {
  FinalCustomer: "Cliente final",
  Wholesale: "Mayorista",
  ExternalCustomer: "Cliente externo",
  Stock: "Stock",
  SelfConsumption: "Autoconsumo",
};

export function TechnicalQueue({ assigned = false }: { assigned?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api<OrderList>(assigned ? "/api/orders/my-assigned?pageSize=50" : "/api/orders/technical-queue?pageSize=50");
      setOrders(response.items);
    } catch (exception) {
      setError(exception instanceof ApiError && exception.status === 403 ? "Tu perfil no tiene acceso a esta cola." : "No se pudo cargar órdenes. Verifica conexión con API.");
    } finally {
      setLoading(false);
    }
  }, [assigned]);

  useEffect(() => { void load(); }, [load]);

  async function claim(orderId: string) {
    setClaimingId(orderId);
    setError("");
    try {
      await api(`/api/orders/${orderId}/claim`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } });
      await load();
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : "No fue posible tomar esta orden.");
    } finally {
      setClaimingId(null);
    }
  }

  return <section className="panel"><div className="table-tools"><div><h2>{assigned ? "Mis órdenes asignadas" : "Órdenes disponibles"}</h2><p>{assigned ? "Órdenes activas bajo tu responsabilidad." : "Selecciona una orden para iniciar diagnóstico."}</p></div><button className="secondary" onClick={() => void load()} disabled={loading}>Actualizar</button></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="table-wrap"><table><thead><tr><th>Orden</th><th>Sucursal</th><th>Tipo</th><th>Servicio</th><th>Estado</th><th /></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="no-data">Cargando…</td></tr> : orders.length === 0 ? <tr><td colSpan={6} className="no-data">No hay órdenes para mostrar.</td></tr> : orders.map((order) => <tr key={order.id}><td><strong>{order.displayNumber}</strong><br /><small>{new Date(order.createdAt).toLocaleDateString("es-EC")}</small></td><td>{order.branchCode}</td><td><span className={`priority priority-${order.queuePriority}`}>{priorityLabel[order.queuePriority ?? ""] ?? "Sin clasificación"}</span></td><td>{order.serviceMode ?? "—"}</td><td>{order.status}</td><td>{assigned ? <Link className="secondary order-link" href={`/operaciones/ordenes/${order.id}`}>Abrir</Link> : <button className="primary" onClick={() => void claim(order.id)} disabled={claimingId === order.id}>{claimingId === order.id ? "Tomando…" : "Tomar orden"}</button>}</td></tr>)}</tbody></table></div></section>;
}
