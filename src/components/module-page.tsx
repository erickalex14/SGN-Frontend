"use client";
import { useMemo, useState } from "react";
import type { RouteDefinition } from "@/lib/routes";
import { TechnicalQueue } from "@/components/technical-queue";
import { OrderDetail } from "@/components/order-detail";
import { LegacyDashboard } from "@/components/legacy-dashboard";
import { LegacyOrderCreate } from "@/components/legacy-order-create";
import { LegacyOrderSearch } from "@/components/legacy-order-search";
import { LegacyTickets } from "@/components/legacy-tickets";
import { TicketDetail } from "@/components/ticket-detail";
import { TicketCreate } from "@/components/ticket-create";
import "./module-page.css";

const columns = ["Código", "Descripción", "Estado", "Actualizado"];
const demoRows = ["No hay datos para mostrar. Conecta esta vista a la API Laravel."];

export function ModulePage({ info, route }: { info: RouteDefinition; route: string }) {
  const [search, setSearch] = useState("");
  const path = useMemo(() => route.split("/").join(" › "), [route]);
  const isForm = info.kind === "form";
  const technicalQueue = route === "operaciones/ordenes-disponibles";
  const documentaryQueue = route === "operaciones/garantias-pendientes";
  const customerServiceQueue = route === "operaciones/atencion-cliente";
  const partsQueue = route === "operaciones/repuestos-pendientes";
  const creditNoteQueue = route === "operaciones/notas-credito-pendientes";
  const deliveryQueue = route === "operaciones/entregas-pendientes";
  const assignedOrders = route === "operaciones/mis-ordenes";
  const assignedOverview = route === "operaciones/ordenes-asignadas";
  const orderId = route.match(/^operaciones\/ordenes\/([0-9a-f-]{36})$/i)?.[1];
  const ticketId = route.match(/^tickets\/([0-9a-f-]{36})$/i)?.[1];
  if (route === "dashboard") return <LegacyDashboard />;
  if (route === "operaciones/ordenes/crear") return <LegacyOrderCreate />;
  if (route === "operaciones/ordenes/buscar") return <LegacyOrderSearch />;
  if (route === "tickets/mis-tickets") return <LegacyTickets />;
  if (route === "tickets/gestion") return <LegacyTickets management />;
  if (route === "tickets/crear") return <TicketCreate />;
  return <><div className="page-heading"><div><p className="breadcrumb">Inicio › {path}</p><h1>{orderId ? "Detalle de orden" : ticketId ? "Detalle de ticket" : info.title}</h1><p>Administración de {info.group.toLowerCase()}.</p></div>{!technicalQueue && !documentaryQueue && !customerServiceQueue && !partsQueue && !creditNoteQueue && !deliveryQueue && !assignedOrders && !assignedOverview && !orderId && !ticketId && <button className="primary">{isForm ? "Guardar" : info.kind === "report" ? "Exportar" : "Nuevo registro"}</button>}</div>{orderId ? <OrderDetail orderId={orderId} /> : ticketId ? <TicketDetail ticketId={ticketId} /> : documentaryQueue ? <TechnicalQueue queue="documentary-warranty" heading="Garantías pendientes" /> : customerServiceQueue ? <TechnicalQueue queue="customer-service" heading="Atención al cliente" /> : partsQueue ? <TechnicalQueue queue="parts" heading="Repuestos pendientes" /> : creditNoteQueue ? <TechnicalQueue queue="credit-notes" heading="Notas de crédito pendientes" /> : deliveryQueue ? <TechnicalQueue queue="delivery" heading="Entregas pendientes" /> : technicalQueue ? <TechnicalQueue /> : assignedOrders ? <TechnicalQueue assigned /> : assignedOverview ? <TechnicalQueue assigned heading="Órdenes asignadas" /> : isForm ? <EntryForm title={info.title} /> : <ListView query={search} onQuery={setSearch} report={info.kind === "report"} />}</>;
}
function EntryForm({ title }: { title: string }) { return <form className="panel entry-form" onSubmit={(e) => e.preventDefault()}><h2>{title}</h2><div className="field-grid"><label>Referencia<input placeholder="Ingrese una referencia" /></label><label>Estado<select defaultValue=""><option value="" disabled>Seleccione un estado</option><option>Activo</option><option>Pendiente</option></select></label><label className="wide">Observaciones<textarea rows={5} placeholder="Detalle de la solicitud" /></label></div><div className="actions"><button type="button" className="secondary">Cancelar</button><button className="primary">Guardar cambios</button></div></form>; }
function ListView({ query, onQuery, report }: { query: string; onQuery: (value: string) => void; report: boolean }) { return <section className="panel"><div className="table-tools"><input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Buscar…" /><button className="secondary">Filtrar</button>{report && <button className="secondary">Descargar Excel</button>}</div><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{demoRows.filter((row) => row.toLowerCase().includes(query.toLowerCase())).map((row) => <tr key={row}><td colSpan={4} className="no-data">{row}</td></tr>)}</tbody></table></div></section>; }
