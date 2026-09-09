"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import "./dashboard-order-metrics.css";

type ListResult = { total: number };
export function DashboardOrderMetrics() {
  const [total, setTotal] = useState<number | null>(null); const [closed, setClosed] = useState<number | null>(null);
  useEffect(() => { let active = true; Promise.all([api<ListResult>("/api/orders?pageSize=1"), api<ListResult>("/api/orders?status=Closed&pageSize=1")]).then(([all, finished]) => { if (active) { setTotal(all.total); setClosed(finished.total); } }).catch(() => { if (active) { setTotal(0); setClosed(0); } }); return () => { active = false; }; }, []);
  const value = (item: number | null) => item === null ? "…" : item.toLocaleString("es-EC");
  return <section className="dom-wrap" aria-label="Resumen de órdenes"><h2><i className="bi bi-clipboard-data" /> Resumen de órdenes</h2><div className="dom-grid"><Metric icon="bi-clipboard-check" tone="blue" label="Total de órdenes" value={value(total)} /><Metric icon="bi-check2-circle" tone="green" label="Finalizadas" value={value(closed)} /><Metric icon="bi-box-seam" tone="amber" label="Entregadas" value={value(closed)} /></div></section>;
}
function Metric({ icon, tone, label, value }: { icon: string; tone: string; label: string; value: string }) { return <article className="dom-card"><span className={tone}><i className={`bi ${icon}`} /></span><div><strong>{value}</strong><small>{label}</small></div></article>; }
