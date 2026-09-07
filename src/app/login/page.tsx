"use client";
import { useState } from "react";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); }
  return <main className="login-page"><section className="login-card"><div className="brand-mark">SGN</div><h1>Bienvenido</h1><p>Ingresa a Sistema de Gestión Novicompu</p><form onSubmit={submit}><label>Correo electrónico<input type="email" name="email" autoComplete="email" required /></label><label>Contraseña<input type="password" name="password" autoComplete="current-password" required /></label><button disabled={loading}>{loading ? "Conectando…" : "Iniciar sesión"}</button></form><small>La autenticación debe conectarse a la API Laravel mediante <code>NEXT_PUBLIC_API_URL</code>.</small><Link href="/dashboard">Ver la interfaz</Link></section></main>;
}