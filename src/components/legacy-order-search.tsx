"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./legacy-order-search.css";

type CurrentOrder = { id: string; displayNumber: string; branchCode: string; status: string; serviceMode: string | null; createdAt: string; invoiceNumber: string | null };
type LegacyOrder = { id: number; number: string; status: string; intakeReason: string | null; invoiceNumber: string | null; receivedAt: string | null; observation: string | null };
type Lookup = { source: "new" | "legacy"; readOnly: boolean; newOrder: CurrentOrder | null; legacyOrder: LegacyOrder | null };

export function LegacyOrderSearch() {
  const [number, setNumber] = useState(""); const [result, setResult] = useState<Lookup | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function search(event: FormEvent) { event.preventDefault(); if (!number.trim()) return; setLoading(true); setError(""); setResult(null); try { setResult(await api<Lookup>(`/api/orders/lookup/${encodeURIComponent(number.trim())}`)); } catch (e) { setError(e instanceof ApiError && e.status === 404 ? "No encontramos esa orden en SGN nuevo ni en el histórico legacy." : "No se pudo realizar la búsqueda."); } finally { setLoading(false); } }
  const order = result?.newOrder ?? result?.legacyOrder;
  return <section className="bo-wrap"><header className="bo-header"><h2><i className="bi bi-search" /> Buscar órdenes</h2><p>Consulta órdenes nuevas y el histórico legacy desde un único punto.</p></header><form className="bo-panel" onSubmit={search}><label>NÚMERO DE ORDEN<div><i className="bi bi-search" /><input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Ej.: UIO-1001" autoFocus /></div></label><button disabled={loading}>{loading ? "Buscando…" : <><i className="bi bi-search" /> Buscar orden</>}</button><button type="button" className="bo-reset" onClick={() => { setNumber(""); setResult(null); setError(""); }}><i className="bi bi-x-circle" /> Limpiar</button></form>{error && <p className="bo-error">{error}</p>}{order && <article className="bo-card"><div className="bo-card-top"><strong>{"displayNumber" in order ? order.displayNumber : order.number}</strong><span className={result?.readOnly ? "legacy" : "new"}>{result?.readOnly ? "Histórico legacy · solo lectura" : "SGN nuevo"}</span></div><dl><div><dt>Estado</dt><dd>{order.status}</dd></div><div><dt>Factura</dt><dd>{order.invoiceNumber || "—"}</dd></div><div><dt>{result?.readOnly ? "Motivo de ingreso" : "Servicio"}</dt><dd>{"serviceMode" in order ? order.serviceMode || "—" : order.intakeReason || "—"}</dd></div><div><dt>{result?.readOnly ? "Fecha de recepción" : "Sucursal"}</dt><dd>{"branchCode" in order ? order.branchCode : order.receivedAt ? new Date(order.receivedAt).toLocaleDateString("es-EC") : "—"}</dd></div></dl>{result?.newOrder ? <Link href={`/operaciones/ordenes/${result.newOrder.id}`}><i className="bi bi-eye" /> Abrir detalle y flujo</Link> : <p className="bo-readonly"><i className="bi bi-lock" /> Esta orden pertenece al sistema anterior; se consulta sin modificarla.</p>}</article>}</section>;
}
