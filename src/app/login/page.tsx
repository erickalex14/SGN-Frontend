"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { getSession, saveSession, type Session } from "@/lib/session";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const session = await api<Session>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ userName: form.get("userName"), password: form.get("password") }),
      });
      saveSession(session);
      router.replace("/dashboard");
    } catch (exception) {
      setError(exception instanceof ApiError && exception.status === 401 ? "Usuario o contraseña inválidos." : "No fue posible iniciar sesión. Intenta otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="login-page"><section className="login-card"><div className="brand-mark">SGN</div><h1>Bienvenido</h1><p>Ingresa a Sistema de Gestión Novicompu</p><form onSubmit={submit}><label>Usuario o correo<input type="text" name="userName" autoComplete="username" required /></label><label>Contraseña<input type="password" name="password" autoComplete="current-password" required /></label>{error && <p role="alert">{error}</p>}<button disabled={loading}>{loading ? "Conectando…" : "Iniciar sesión"}</button></form><small>Conectado a la API SGN mediante <code>NEXT_PUBLIC_API_URL</code>.</small></section></main>;
}
