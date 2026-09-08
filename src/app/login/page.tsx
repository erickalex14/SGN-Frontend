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
  const [showPassword, setShowPassword] = useState(false);

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

  return <main className="login-page"><section className="login-brand"><div className="brand-shade" /><div className="brand-copy"><img src="/logosgn1.png" alt="SGN" /><p>Sistema avanzado para la gestión técnica y operativa, diseñado para maximizar la eficiencia en campo.</p></div></section><section className="login-form-side"><div className="mobile-brand"><img src="/logosgn1.png" alt="SGN" /><span>Servicio Gestión Novitec</span></div><div className="login-card"><header><h1>Bienvenido de nuevo</h1><p>Accede a tu panel de gestión técnica</p></header>{error && <div className="login-error" role="alert"><i className="bi bi-shield-lock" /><div><strong>{error}</strong><span>Revisa tus datos e intenta nuevamente.</span></div></div>}<form onSubmit={submit}><label>Correo o usuario<span className="input-wrap"><i className="bi bi-person" /><input type="text" name="userName" autoComplete="username" placeholder="ejemplo@novitec.com" required autoFocus /></span></label><label className="password-label"><span>Contraseña <small>Soporte interno</small></span><span className="input-wrap"><i className="bi bi-lock" /><input type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="••••••••" required /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}><i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`} /></button></span></label><label className="remember"><input type="checkbox" defaultChecked /> Mantener sesión iniciada</label><button className="login-submit" disabled={loading}>{loading ? "Conectando…" : <>Entrar <i className="bi bi-arrow-right" /></>}</button></form><footer>© 2024 SGN. Uso exclusivo de personal autorizado.</footer></div></section></main>;
}
