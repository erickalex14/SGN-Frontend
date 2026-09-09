"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearSession } from "@/lib/session";
import "./legacy-identity.css";

// ── Mi cuenta ─────────────────────────────────────────────────────
type Account = { id: string; userName: string; displayName: string; phone: string | null; email: string | null; accessProfile: string | null; affiliation: string; jobRole: string };
type Msg = { kind: "ok" | "err"; text: string } | null;

export function MyAccount() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState("");
  const [profileMsg, setProfileMsg] = useState<Msg>(null);
  const [passMsg, setPassMsg] = useState<Msg>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void api<Account>("/api/account").then(setAccount).catch((e) => setLoadError(e instanceof ApiError ? e.message : "No se pudo cargar la cuenta."));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get("displayName") ?? "").trim();
    if (displayName.length < 3) { setProfileMsg({ kind: "err", text: "El nombre debe tener al menos 3 caracteres." }); return; }
    setSavingProfile(true); setProfileMsg(null);
    try {
      const updated = await api<Account>("/api/account", { method: "PUT", body: JSON.stringify({ displayName, phone: form.get("phone") || null, email: form.get("email") || null }) });
      setAccount(updated); setProfileMsg({ kind: "ok", text: "Datos actualizados." });
    } catch (e) { setProfileMsg({ kind: "err", text: e instanceof ApiError ? e.message : "No se pudo guardar." }); }
    finally { setSavingProfile(false); }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const current = String(data.get("current") ?? ""); const next = String(data.get("next") ?? ""); const confirm = String(data.get("confirm") ?? "");
    if (next.length < 8) { setPassMsg({ kind: "err", text: "La nueva contraseña debe tener al menos 8 caracteres." }); return; }
    if (next !== confirm) { setPassMsg({ kind: "err", text: "Las contraseñas no coinciden." }); return; }
    setSavingPass(true); setPassMsg(null);
    try {
      await api("/api/account/password", { method: "PUT", body: JSON.stringify({ currentPassword: current, newPassword: next }) });
      form.reset(); setPassMsg({ kind: "ok", text: "Contraseña cambiada." });
    } catch (e) { setPassMsg({ kind: "err", text: e instanceof ApiError ? e.message : "No se pudo cambiar la contraseña." }); }
    finally { setSavingPass(false); }
  }

  function logout() { clearSession(); router.replace("/login"); }

  if (loadError) return <div className="cfg-container"><div className="cfg-msg cfg-msg-err">{loadError}</div></div>;
  if (!account) return <div className="cfg-container"><div className="cfg-card"><div className="cfg-body">Cargando…</div></div></div>;

  const eye = (name: string) => <button type="button" onClick={() => setShowPass((s) => ({ ...s, [name]: !s[name] }))}><i className={`bi ${showPass[name] ? "bi-eye-slash" : "bi-eye"}`} /></button>;

  return <section className="cfg-container">
    <div className="cfg-titulo"><h2><i className="bi bi-person-circle" /> Mi Cuenta</h2><p>Administra tu cuenta y credenciales.</p></div>

    <div className="cfg-card">
      <div className="cfg-card-header">
        <div className="cfg-avatar">{(account.displayName[0] ?? account.userName[0] ?? "?").toUpperCase()}</div>
        <div>
          <div className="cfg-user-name">{account.displayName || account.userName}</div>
          <div className="cfg-user-sub">@{account.userName} · <span className="cfg-rol-badge">{account.accessProfile ?? account.jobRole}</span></div>
        </div>
      </div>
    </div>

    <form className="cfg-card" onSubmit={saveProfile}>
      <div className="cfg-section-title"><i className="bi bi-person-badge" /> Datos personales</div>
      <div className="cfg-body">
        <div className="cfg-campo"><label>Nombre completo</label><input name="displayName" defaultValue={account.displayName} maxLength={100} /></div>
        <div className="cfg-campo"><label>Teléfono</label><input name="phone" defaultValue={account.phone ?? ""} maxLength={15} /></div>
        <div className="cfg-campo"><label>Correo electrónico</label><input name="email" type="email" defaultValue={account.email ?? ""} maxLength={100} /></div>
        <button className="cfg-btn cfg-btn-primary" disabled={savingProfile}><i className="bi bi-floppy" /> {savingProfile ? "Guardando…" : "Guardar datos"}</button>
        {profileMsg && <div className={`cfg-msg cfg-msg-${profileMsg.kind}`}><i className={`bi ${profileMsg.kind === "ok" ? "bi-check-circle" : "bi-exclamation-circle"}`} />{profileMsg.text}</div>}
      </div>
    </form>

    <form className="cfg-card" onSubmit={savePassword}>
      <div className="cfg-section-title"><i className="bi bi-lock" /> Cambiar contraseña</div>
      <div className="cfg-body">
        <div className="cfg-campo"><label>Contraseña actual</label><div className="cfg-input-eye"><input name="current" type={showPass.current ? "text" : "password"} />{eye("current")}</div></div>
        <div className="cfg-campo"><label>Nueva contraseña</label><div className="cfg-input-eye"><input name="next" type={showPass.next ? "text" : "password"} />{eye("next")}</div></div>
        <div className="cfg-campo"><label>Confirmar nueva contraseña</label><div className="cfg-input-eye"><input name="confirm" type={showPass.confirm ? "text" : "password"} />{eye("confirm")}</div></div>
        <button className="cfg-btn cfg-btn-primary" disabled={savingPass}><i className="bi bi-shield-lock" /> {savingPass ? "Guardando…" : "Cambiar contraseña"}</button>
        {passMsg && <div className={`cfg-msg cfg-msg-${passMsg.kind}`}><i className={`bi ${passMsg.kind === "ok" ? "bi-check-circle" : "bi-exclamation-circle"}`} />{passMsg.text}</div>}
      </div>
    </form>

    <div className="cfg-card cfg-card-danger">
      <div className="cfg-section-title"><i className="bi bi-box-arrow-right" /> Sesión</div>
      <div className="cfg-body">
        <p className="cfg-danger-txt">Al cerrar sesión deberás volver a ingresar tus credenciales.</p>
        <button type="button" className="cfg-btn cfg-btn-danger" onClick={logout}><i className="bi bi-box-arrow-right" /> Cerrar sesión</button>
      </div>
    </div>
  </section>;
}

// ── Grupos de acceso ──────────────────────────────────────────────
type Profile = { id: string; name: string; description: string | null; isSuperAdmin: boolean; permissionCount: number };
type ProfilePermission = { module: string; action: string; isAllowed: boolean };
type ProfileDetail = { profile: Profile; permissions: ProfilePermission[] };

export function AccessProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ProfileDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setProfiles(await api<Profile[]>("/api/access-profiles")); }
    catch (e) { setError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene el permiso grupos_acceso/ver." : "No se pudo cargar los grupos."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function openPermissions(id: string) {
    setDetailLoading(true); setDetail(null);
    try { setDetail(await api<ProfileDetail>(`/api/access-profiles/${id}`)); }
    catch { setError("No se pudo cargar el detalle de permisos."); }
    finally { setDetailLoading(false); }
  }

  return <section className="ga-wrap">
    <div className="ga-hdr">
      <div className="ga-hdr-text"><h2><i className="bi bi-shield-lock" /> Grupos de Acceso</h2><p>Perfiles de autorización del sistema y sus permisos.</p></div>
    </div>
    <p className="ga-note"><i className="bi bi-info-circle" /> Alta, edición y borrado de grupos requieren endpoints de escritura aún no disponibles en el API. Vista de solo lectura.</p>

    {error ? <div className="ga-empty">{error}</div>
      : loading ? <div className="ga-empty">Cargando…</div>
      : profiles.length === 0 ? <div className="ga-empty"><i className="bi bi-inbox" style={{ fontSize: 32, display: "block", marginBottom: 12 }} />No hay grupos registrados.</div>
      : <div className="ga-grid">{profiles.map((p) => <div className="ga-card" key={p.id}>
          <h3 className="ga-c-title">{p.name}{p.isSuperAdmin && <span className="ga-badge-sa">SUPERADMIN</span>}</h3>
          <div className="ga-c-desc">{p.description || "Sin descripción."}</div>
          <div className="ga-c-ftr">
            <div className="ga-c-users"><i className="bi bi-key-fill" /> {p.permissionCount} permiso(s)</div>
            <button className="ga-btn-icon" onClick={() => void openPermissions(p.id)}><i className="bi bi-key" /> Ver permisos</button>
          </div>
        </div>)}</div>}

    {(detail || detailLoading) && <div className="ga-modal-overlay" onClick={() => setDetail(null)}>
      <div className="ga-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="ga-modal-hdr"><h3>{detail ? `Permisos · ${detail.profile.name}` : "Cargando…"}</h3><button className="ga-modal-close" onClick={() => setDetail(null)}><i className="bi bi-x" /></button></div>
        <div className="ga-modal-body">
          {detailLoading ? "Cargando permisos…"
            : detail && detail.permissions.length === 0 ? "Este grupo no tiene permisos configurados."
            : detail && <table className="perm-table"><thead><tr><th>Módulo</th><th>Acción</th><th>Permitido</th></tr></thead><tbody>{detail.permissions.map((perm, i) => <tr key={i}><td>{perm.module}</td><td>{perm.action}</td><td className={perm.isAllowed ? "perm-yes" : "perm-no"}>{perm.isAllowed ? "Sí" : "No"}</td></tr>)}</tbody></table>}
        </div>
      </div>
    </div>}
  </section>;
}
