"use client";

import { getSession } from "@/lib/session";
import "./legacy-dashboard.css";

const cards = [
  ["bi-clipboard-check", "blue", "Órdenes totales"],
  ["bi-calendar-check", "green", "Ingresadas hoy"],
  ["bi-tools", "amber", "Técnicos"],
  ["bi-people", "purple", "Clientes"],
  ["bi-shop", "rose", "Sucursales"],
  ["bi-shield-check", "cyan", "Centros CAS (OT)"],
] as const;

export function LegacyDashboard() {
  const session = getSession();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return <div className="legacy-dash"><header className="legacy-dash-header"><h1>{greeting}, {session?.userName ?? "Usuario"}</h1><p>Panel operativo con indicadores y gráficos en tiempo real.</p><span className="legacy-scope"><i className="bi bi-geo-alt" /> Vista de tu sucursal</span></header><section className="legacy-kpis">{cards.map(([icon, tone, label]) => <article className="legacy-kpi" key={label}><span className={`legacy-kpi-icon ${tone}`}><i className={`bi ${icon}`} /></span><div><strong>—</strong><small>{label}</small></div></article>)}</section><section className="legacy-chart-grid three"><DashboardPanel icon="bi-graph-up" title="Órdenes últimos 7 días"><ChartPlaceholder bars={[31, 55, 38, 76, 46, 64, 82]} /></DashboardPanel><DashboardPanel icon="bi-pie-chart" title="Estado de órdenes"><div className="legacy-donut" /><div className="legacy-legend"><span><i className="blue" /> En proceso</span><span><i className="amber" /> Pendientes</span><span><i className="green" /> Finalizadas</span></div></DashboardPanel><DashboardPanel icon="bi-hdd-stack" title="Tipos de equipo"><ChartPlaceholder bars={[80, 58, 66, 40, 30]} /></DashboardPanel></section><section className="legacy-chart-grid two"><DashboardPanel icon="bi-person-gear" title="Rendimiento por técnico"><div className="legacy-empty">Las métricas se activarán con endpoint de dashboard.</div></DashboardPanel><DashboardPanel icon="bi-box-seam" title="Estado de repuestos"><div className="legacy-donut small" /><div className="legacy-legend"><span><i className="blue" /> Solicitados</span><span><i className="amber" /> En compra</span><span><i className="green" /> Despachados</span></div></DashboardPanel></section></div>;
}

function DashboardPanel({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return <article className="legacy-chart-panel"><h2><i className={`bi ${icon}`} /> {title}</h2>{children}</article>;
}

function ChartPlaceholder({ bars }: { bars: number[] }) {
  return <div className="legacy-bars">{bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>;
}
