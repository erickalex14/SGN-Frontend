"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSession } from "@/lib/session";
import "./ticket-support-pages.css";

export function TicketSupportProfile() {
  const session = getSession();
  const [saved, setSaved] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaved(true); }

  return <section className="tsp-wrap tsp-profile">
    <header className="tsp-title"><Link href="/tickets/mis-tickets"><i className="bi bi-arrow-left" /> Volver a Mis Solicitudes</Link><h2><i className="bi bi-person-gear" /> Mis Datos Técnicos &amp; Conexión</h2><p>Mantén actualizada tu información de soporte para que el equipo pueda asistirte rápidamente en cada ticket.</p></header>
    <article className="tsp-store"><i className="bi bi-shop" /><div><small>Punto de Venta / Tienda Asignada:</small><strong>Tienda no asignada <em>NOVICOMPU</em></strong></div></article>
    <form className="tsp-panel tsp-form" onSubmit={submit}><h3><i className="bi bi-laptop" /> Información de Soporte &amp; Acceso</h3><div className="tsp-fields"><label>Usuario / Cédula<input value={session?.userName ?? ""} readOnly /></label><label>Nombre Completo<input value={session?.userName ?? ""} readOnly /></label></div><hr /><div className="tsp-fields"><label><i className="bi bi-envelope-at" /> Correo de Empresa / Institucional<input type="email" placeholder="ejemplo@novicompu.com / ejemplo@env.com.ec" /><small>Recibirás notificaciones cuando tu ticket sea atendido o resuelto.</small></label><label><i className="bi bi-whatsapp" /> Teléfono / WhatsApp de Contacto<input placeholder="Ej: 0991234567" /></label></div><div className="tsp-fields tsp-three"><label><i className="bi bi-display" /> ID de AnyDesk<input placeholder="Ej: 123 456 789" /><small>Para conexión remota del equipo de Quito.</small></label><label><i className="bi bi-person-badge" /> Usuario de MBA3<input placeholder="Ej: JPEREZ" /></label><label><i className="bi bi-upc-scan" /> Código de Usuario / Vendedor<input placeholder="Ej: VEND-012" /></label></div>{saved && <p className="tsp-success">Los datos quedaron listos para guardar cuando conectes este formulario a la API.</p>}<footer><Link href="/tickets/mis-tickets">Cancelar</Link><button><i className="bi bi-check2-circle" /> Guardar Mis Datos</button></footer></form>
  </section>;
}
