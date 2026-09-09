"use client";

import { useEffect } from "react";
import { AppShell as BaseAppShell } from "@/components/app-shell-base";

const supportLinks = [
  ["/tickets/gestion", "bi-headset", "Mesa de Ayuda (Quito)"],
  ["/tickets/solicitantes", "bi-people-fill", "Gestión Solicitantes"],
  ["/tickets/auditoria-reportes", "bi-bar-chart-line-fill", "Auditoría & Reportes"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const group = [...document.querySelectorAll<HTMLElement>(".nav-group")].find((item) => item.querySelector(".nav-toggle")?.textContent?.includes("Soporte"));
    if (!group) return;
    const toggle = group.querySelector<HTMLElement>(".nav-toggle .nav-label");
    if (toggle) toggle.textContent = "Tickets & Soporte";
    const menu = group.querySelector<HTMLElement>(".nav-submenu");
    if (!menu) return;
    menu.querySelectorAll("[data-ticket-extra]").forEach((item) => item.remove());
    const oldManagement = [...menu.querySelectorAll<HTMLAnchorElement>("a")].find((item) => item.getAttribute("href") === "/tickets/gestion");
    if (oldManagement) oldManagement.remove();
    supportLinks.forEach(([href, icon, label]) => { const link = document.createElement("a"); link.href = href; link.dataset.ticketExtra = "true"; link.innerHTML = `<i class="bi ${icon}"></i><span class="nav-label" style="margin-left:10px">${label}</span>`; menu.appendChild(link); });
    return () => { menu.querySelectorAll("[data-ticket-extra]").forEach((item) => item.remove()); };
  }, []);
  return <BaseAppShell>{children}</BaseAppShell>;
}
