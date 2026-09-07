"use client";
import { useMemo, useState } from "react";
import type { RouteDefinition } from "@/lib/routes";
import { TechnicalQueue } from "@/components/technical-queue";
import { OrderDetail } from "@/components/order-detail";
import "./module-page.css";

const columns = ["Código", "Descripción", "Estado", "Actualizado"];
const demoRows = ["No hay datos para mostrar. Conecta esta vista a la API Laravel."];

export function ModulePage({ info, route }: { info: RouteDefinition; route: string }) {
  const [search, setSearch] = useState("");
  const path = useMemo(() => route.split("/").join(" › "), [route]);
  const isForm = info.kind === "form";
  const technicalQueue = route === "operaciones/ordenes-disponibles";
  const assignedOrders = route === "operaciones/mis-ordenes";
  const orderId = route.match(/^operaciones\/ordenes\/([0-9a-f-]{36})$/i)?.[1];
  return <><div className="page-heading"><div><p className="breadcrumb">Inicio › {path}</p><h1>{orderId ? "Detalle de orden" : info.title}</h1><p>Administración de {info.group.toLowerCase()}.</p></div>{!technicalQueue && !assignedOrders && !orderId && <button className="primary">{isForm ? "Guardar" : info.kind === "report" ? "Exportar" : "Nuevo registro"}</button>}</div>{orderId ? <OrderDetail orderId={orderId} /> : technicalQueue ? <TechnicalQueue /> : assignedOrders ? <TechnicalQueue assigned /> : route === "dashboard" ? <Dashboard /> : isForm ? <EntryForm title={info.title} /> : <ListView query={search} onQuery={setSearch} report={info.kind === "report"} />}</>;
}
function Dashboard() { return <><section className="metrics"><Metric title="Órdenes activas" value="—" /><Metric title="Tickets pendientes" value="—" /><Metric title="Facturación del mes" value="—" /><Metric title="Informes emitidos" value="—" /></section><section className="panel empty"><h2>Resumen operativo</h2><p>Conecta <code>NEXT_PUBLIC_API_URL</code> para mostrar los indicadores reales que Laravel entrega al dashboard.</p></section></>; }
function Metric({ title, value }: { title: string; value: string }) { return <article className="metric"><span>{title}</span><strong>{value}</strong><small>Datos desde Laravel</small></article>; }
function EntryForm({ title }: { title: string }) { return <form className="panel entry-form" onSubmit={(e) => e.preventDefault()}><h2>{title}</h2><div className="field-grid"><label>Referencia<input placeholder="Ingrese una referencia" /></label><label>Estado<select defaultValue=""><option value="" disabled>Seleccione un estado</option><option>Activo</option><option>Pendiente</option></select></label><label className="wide">Observaciones<textarea rows={5} placeholder="Detalle de la solicitud" /></label></div><div className="actions"><button type="button" className="secondary">Cancelar</button><button className="primary">Guardar cambios</button></div></form>; }
function ListView({ query, onQuery, report }: { query: string; onQuery: (value: string) => void; report: boolean }) { return <section className="panel"><div className="table-tools"><input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Buscar…" /><button className="secondary">Filtrar</button>{report && <button className="secondary">Descargar Excel</button>}</div><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{demoRows.filter((row) => row.toLowerCase().includes(query.toLowerCase())).map((row) => <tr key={row}><td colSpan={4} className="no-data">{row}</td></tr>)}</tbody></table></div></section>; }
