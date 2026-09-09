"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import "./legacy-tickets.css";

type Ticket = { id: string; code: string; title: string; category: string; type: string; status: "abierto" | "cerrado"; date: string };
const tickets: Ticket[] = [
  { id: "82", code: "SYS-000082", title: "Creación de usuario MBA para la nueva sucursal 186 Imp Libertad", category: "Creación de usuario MBA", type: "sistemas", status: "cerrado", date: "4/9/2026, 1:26:50 p. m." },
  { id: "90", code: "SYS-000090", title: "Solicitud de baja de Pre-Orden de Novitec por error", category: "Otro problema de TI", type: "sistemas", status: "abierto", date: "4/9/2026, 1:10:40 p. m." },
  { id: "81", code: "SYS-000081", title: "Creación de ícono del sistema MBA para la nueva sucursal 186", category: "Colocación / Creación ícono MBA", type: "sistemas", status: "cerrado", date: "4/9/2026, 12:38:38 p. m." },
  { id: "89", code: "SYS-000089", title: "Actualización de acceso de sistemas", category: "Accesos y usuarios", type: "sistemas", status: "abierto", date: "4/9/2026, 12:12:10 p. m." },
  { id: "88", code: "SYS-000088", title: "Soporte de aplicación de punto de venta", category: "Soporte técnico", type: "soporte técnico", status: "abierto", date: "4/9/2026, 11:48:05 a. m." },
  { id: "49", code: "SYS-000049", title: "Revisión de configuración de usuario", category: "Sistemas", type: "sistemas", status: "cerrado", date: "3/9/2026, 4:32:11 p. m." },
];

export function TicketListScreen({ management = false }: { management?: boolean }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("");
  const visible = useMemo(() => tickets.filter((ticket) => (`${ticket.code} ${ticket.title} ${ticket.category}`).toLowerCase().includes(query.toLowerCase()) && (!status || ticket.status === status)), [query, status]);
  const clear = () => { setQuery(""); setStatus(""); };
  return <section className="lt-wrap"><header className="lt-head"><div><span><i className="bi bi-ticket-perforated" /> Portal de Requerimientos y Soporte</span><h2>{management ? "Gestión y Atención de Tickets" : "Mis Solicitudes y Tickets"}</h2><p>{management ? "Revisa y controla los tickets a tu cargo." : "Haz seguimiento a tus solicitudes en tiempo real."}</p></div><Link href="/tickets/crear"><i className="bi bi-plus-circle-fill" /> Crear nuevo ticket</Link></header><div className="lt-kpis"><div><small>Total creados</small><strong>{management ? tickets.length : 85}</strong></div><div><small>En atención</small><strong>{management ? tickets.filter((ticket) => ticket.status === "abierto").length : 85}</strong></div><div><small>Resueltos</small><strong>0</strong></div><div><small>Cerrados</small><strong>{management ? tickets.filter((ticket) => ticket.status === "cerrado").length : 0}</strong></div></div><div className="lt-filters"><label><i className="bi bi-search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Código, título o categoría..." /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option><option value="abierto">Abierto</option><option value="cerrado">Cerrado</option></select><button type="button" onClick={clear}><i className="bi bi-x-circle" /> Limpiar</button></div>{visible.length ? <div className="lt-grid">{visible.map((ticket) => <article key={ticket.id} className="lt-card"><div><strong>{ticket.code}</strong><span className={`lt-status ${ticket.status === "cerrado" ? "Closed" : "Open"}`}>{ticket.status}</span></div><h3>{ticket.title}</h3><p><i className="bi bi-tag" /> {ticket.category} · {ticket.type}</p><footer><small><i className="bi bi-clock" /> {ticket.date}</small><Link href={`/tickets/${ticket.id}`}>Ver <i className="bi bi-chevron-right" /></Link></footer></article>)}</div> : <div className="lt-empty"><i className="bi bi-inbox" /> No hay tickets que coincidan con los filtros.<div style={{ marginTop: 14 }}><button className="secondary" type="button" onClick={clear}>Limpiar filtros</button></div></div>}</section>;
}
