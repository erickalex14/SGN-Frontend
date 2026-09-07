"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { href: string; icon: string; label: string };
type Group = { icon: string; label: string; items: Item[] };
const groups: Group[] = [
  { icon: "bi-people", label: "Técnicos", items: [{ href: "/tecnicos", icon: "bi-speedometer2", label: "Rendimiento de técnicos" }] },
  { icon: "bi-clipboard-plus", label: "Órdenes", items: [{ href: "/operaciones/ordenes/crear", icon: "bi-plus-circle", label: "Crear Orden" }, { href: "/operaciones/mis-ordenes", icon: "bi-person-check", label: "Mis Órdenes" }, { href: "/operaciones/ordenes-asignadas", icon: "bi-list-check", label: "Órdenes Asignadas" }, { href: "/operaciones/ordenes/buscar", icon: "bi-search", label: "Buscar Órdenes" }, { href: "/operaciones/preordenes", icon: "bi-file-earmark-plus", label: "Preórdenes" }] },
  { icon: "bi-file-earmark-text", label: "Documentación", items: [{ href: "/operaciones/informes/crear", icon: "bi-file-earmark-plus", label: "Crear Informe" }, { href: "/operaciones/mis-informes", icon: "bi-journal-text", label: "Mis Informes" }, { href: "/operaciones/informes/buscar", icon: "bi-search", label: "Buscar Informes" }, { href: "/operaciones/presupuestos", icon: "bi-calculator", label: "Proformas" }, { href: "/operaciones/gestion-nc", icon: "bi-receipt-cutoff", label: "Notas de Crédito" }] },
  { icon: "bi-box-seam", label: "Inventario", items: [{ href: "/inventario/productos", icon: "bi-box", label: "Productos" }, { href: "/inventario/marcas", icon: "bi-tags", label: "Marcas" }, { href: "/inventario/repuestos", icon: "bi-tools", label: "Repuestos" }, { href: "/operaciones/listas-compra", icon: "bi-cart", label: "Listas de Compra" }] },
  { icon: "bi-buildings", label: "Directorios", items: [{ href: "/directorio/empresas", icon: "bi-building", label: "Empresas" }, { href: "/directorio/cas", icon: "bi-geo-alt", label: "CAS" }, { href: "/directorio/sucursales", icon: "bi-diagram-3", label: "Sucursales" }] },
  { icon: "bi-cash-stack", label: "Contabilidad", items: [{ href: "/contabilidad/caja-chica", icon: "bi-wallet2", label: "Caja Chica" }, { href: "/contabilidad/caja-general", icon: "bi-cash", label: "Caja General" }, { href: "/contabilidad/recuento-b2b", icon: "bi-receipt", label: "Recuento B2B" }, { href: "/contabilidad/facturas", icon: "bi-file-earmark-text", label: "Facturación" }] },
  { icon: "bi-headset", label: "Soporte", items: [{ href: "/tickets/mis-tickets", icon: "bi-ticket", label: "Mis Tickets" }, { href: "/tickets/crear", icon: "bi-plus-circle", label: "Crear Ticket" }, { href: "/tickets/gestion", icon: "bi-kanban", label: "Gestión de Tickets" }] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  return <><div className={`sidebar-overlay ${mobileOpen ? "active" : ""}`} onClick={() => setMobileOpen(false)} />
    <div className="wrapper"><aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-header"><img src="/SGN.png" alt="SGN" className="sidebar-logo-full" /><button className="btn-collapse" onClick={() => setCollapsed(!collapsed)} title="Colapsar menú"><i className={`bi ${collapsed ? "bi-chevron-double-right" : "bi-chevron-double-left"}`} /></button></div>
      <Link data-tip="Dashboard" href="/dashboard"><i className="bi bi-speedometer2" /><span className="nav-label" style={{ marginLeft: 10 }}>Dashboard</span></Link>
      {groups.map((group) => <div className="nav-group" key={group.label}><a className={`nav-toggle ${open === group.label ? "open" : ""}`} data-tip={group.label} onClick={() => setOpen(open === group.label ? null : group.label)}><i className={`bi ${group.icon}`} /><span className="nav-label" style={{ marginLeft: 10 }}>{group.label}</span><i className="bi bi-chevron-down nav-arrow ms-auto" /></a><div className={`nav-submenu ${open === group.label ? "open" : ""}`}>{group.items.map((item) => <Link key={item.href} data-tip={item.label} href={item.href}><i className={`bi ${item.icon}`} /><span className="nav-label" style={{ marginLeft: 10 }}>{item.label}</span></Link>)}</div></div>)}
      <div className="sidebar-buzon"><Link data-tip="Mi Cuenta" href="/mi-cuenta"><i className="bi bi-person-circle" /><span className="nav-label" style={{ marginLeft: 10 }}>Mi Cuenta</span></Link></div>
    </aside><div className="main-content"><div className="topbar"><button className="btn-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menú"><i className="bi bi-list" /></button><img src="/SGNI.png" alt="SGN" className="topbar-logo" /><div className="gs-wrap"><i className="bi bi-search gs-ico" /><input className="gs-input" placeholder="Buscar por orden, cliente, C.I., serie, factura…" /></div><div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}><span className="topbar-username"><i className="bi bi-person-circle me-1" />Usuario</span><button className="btn btn-sm btn-logout">Cerrar sesión</button></div></div><div className="content-area">{children}</div></div></div></>;
}