"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./legacy-directory.css";

type Field = { key: string; label: string; required?: boolean; type?: "text" | "number"; options?: { value: string; label: string }[] };

function useList<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await api<T[]>(endpoint)); }
    catch (e) { setError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene permiso para ver este directorio." : "No se pudo cargar el directorio."); }
    finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { void load(); }, [load]);
  return { items, error, loading, reload: load };
}

function CreateCard({ title, fields, endpoint, onCreated }: { title: string; fields: Field[]; endpoint: string; onCreated: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    for (const field of fields) if (field.required && !values[field.key]?.trim()) { setMsg({ kind: "error", text: `${field.label} es obligatorio.` }); return; }
    setSaving(true); setMsg(null);
    try {
      const body: Record<string, unknown> = {};
      for (const field of fields) {
        const raw = values[field.key]?.trim() ?? "";
        body[field.key] = raw === "" ? null : field.type === "number" ? Number(raw) : raw;
      }
      await api(endpoint, { method: "POST", body: JSON.stringify(body) });
      setValues({}); setMsg({ kind: "ok", text: "Registro creado." }); onCreated();
    } catch (e) { setMsg({ kind: "error", text: e instanceof ApiError ? e.message : "No se pudo crear el registro." }); }
    finally { setSaving(false); }
  }

  return <form className="dir-card" onSubmit={submit}>
    <div className="dir-card-hdr"><h3><i className="bi bi-plus-circle" /> {title}</h3></div>
    <div className="dir-card-body">
      {msg && <div className={`dir-msg ${msg.kind}`}>{msg.text}</div>}
      <div className="dir-grid">{fields.map((field) => <label className="dir-campo" key={field.key}>
        <span>{field.label}{field.required && <span> *</span>}</span>
        {field.options
          ? <select value={values[field.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}><option value="">— Seleccione —</option>{field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          : <input type={field.type === "number" ? "number" : "text"} value={values[field.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))} />}
      </label>)}</div>
      <div className="dir-btns">
        <button type="button" className="btn-dir-sec" onClick={() => { setValues({}); setMsg(null); }}><i className="bi bi-x-circle" /> Limpiar</button>
        <button className="btn-dir-ok" disabled={saving}><i className="bi bi-floppy" /> {saving ? "Guardando…" : "Crear"}</button>
      </div>
    </div>
  </form>;
}

function TableCard({ title, count, cols, error, loading, empty, children }: { title: string; count: number; cols: string[]; error: string; loading: boolean; empty: string; children: React.ReactNode }) {
  return <div className="dir-card">
    <div className="dir-card-hdr"><h3><i className="bi bi-table" /> {title}</h3><span className="dir-count">{count}</span></div>
    <div className="dir-card-body flush">
      {error ? <div className="dir-empty">{error}</div>
        : loading ? <div className="dir-empty">Cargando…</div>
        : count === 0 ? <div className="dir-empty">{empty}</div>
        : <table className="dir-tabla"><thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{children}</tbody></table>}
    </div>
  </div>;
}

// ── Sucursales Novitec ─────────────────────────────────────────────
type Branch = { id: string; code: string; name: string; city: string; isActive: boolean };
export function DirectoryBranches() {
  const { items, error, loading, reload } = useList<Branch>("/api/branches");
  return <section className="dir-wrap">
    <div className="dir-titulo"><h2><i className="bi bi-shop" /> Sucursales Novitec</h2><p>Crear y consultar sucursales de Novitecnología.</p></div>
    <p className="dir-note"><i className="bi bi-info-circle" /> La edición de sucursales requiere un endpoint PUT aún no disponible en el API.</p>
    <CreateCard title="Nueva sucursal" endpoint="/api/branches" onCreated={reload}
      fields={[{ key: "code", label: "Secuencial / código", required: true }, { key: "name", label: "Nombre", required: true }, { key: "city", label: "Ciudad", required: true }]} />
    <TableCard title="Sucursales registradas" count={items.length} error={error} loading={loading} empty="No hay sucursales." cols={["Código", "Nombre", "Ciudad", "Estado"]}>
      {items.map((b) => <tr key={b.id}><td><span className="dir-badge">{b.code}</span></td><td>{b.name}</td><td>{b.city}</td><td><span className="dir-pill">{b.isActive ? "Activa" : "Inactiva"}</span></td></tr>)}
    </TableCard>
  </section>;
}

// ── Empresas ───────────────────────────────────────────────────────
type Company = { id: string; name: string; taxId: string; phone: string | null; email: string | null; address: string | null };
export function DirectoryCompanies() {
  const { items, error, loading } = useList<Company>("/api/companies");
  return <section className="dir-wrap">
    <div className="dir-titulo"><h2><i className="bi bi-building" /> Empresas</h2><p>Empresas con órdenes o servicios corporativos.</p></div>
    <p className="dir-note"><i className="bi bi-info-circle" /> Alta y edición de empresas restringida a superadministrador; sin endpoint de escritura expuesto todavía.</p>
    <TableCard title="Empresas registradas" count={items.length} error={error} loading={loading} empty="No hay empresas." cols={["Nombre", "RUC", "Teléfono", "Correo", "Dirección"]}>
      {items.map((c) => <tr key={c.id}><td>{c.name}</td><td><span className="dir-badge">{c.taxId}</span></td><td>{c.phone || "—"}</td><td>{c.email || "—"}</td><td>{c.address || "—"}</td></tr>)}
    </TableCard>
  </section>;
}

// ── Centros autorizados (CAS) ──────────────────────────────────────
type ServiceCenter = { id: string; code: string; name: string; type: string; branchId: string | null; isActive: boolean };
const casTypeLabels: Record<string, string> = { Unclassified: "Sin clasificar", Logistics: "Logística", AuthorizedTechnicalService: "Servicio técnico autorizado" };
export function DirectoryServiceCenters() {
  const { items, error, loading, reload } = useList<ServiceCenter>("/api/service-centers");
  const { items: branches } = useList<Branch>("/api/branches");
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, `${b.code} · ${b.name}`])), [branches]);
  return <section className="dir-wrap">
    <div className="dir-titulo"><h2><i className="bi bi-geo-alt" /> Centros autorizados (CAS)</h2><p>Centros de servicio autorizados y logística.</p></div>
    <CreateCard title="Nuevo CAS" endpoint="/api/service-centers" onCreated={reload}
      fields={[
        { key: "code", label: "Código", required: true },
        { key: "name", label: "Nombre", required: true },
        { key: "type", label: "Tipo", required: true, options: Object.entries(casTypeLabels).map(([value, label]) => ({ value, label })) },
        { key: "branchId", label: "Sucursal vinculada", options: branches.map((b) => ({ value: b.id, label: `${b.code} · ${b.name}` })) },
      ]} />
    <TableCard title="CAS registrados" count={items.length} error={error} loading={loading} empty="No hay centros autorizados." cols={["Código", "Nombre", "Tipo", "Sucursal", "Estado"]}>
      {items.map((c) => <tr key={c.id}><td><span className="dir-badge">{c.code}</span></td><td>{c.name}</td><td>{casTypeLabels[c.type] ?? c.type}</td><td>{c.branchId ? branchName.get(c.branchId) ?? "—" : "—"}</td><td><span className="dir-pill">{c.isActive ? "Activo" : "Inactivo"}</span></td></tr>)}
    </TableCard>
  </section>;
}
