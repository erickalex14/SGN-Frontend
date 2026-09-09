"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./legacy-inventory.css";

type Brand = { id: string; name: string };
type Branch = { id: string; code: string; name: string; city: string };
type PhysItem = { id: string; branchId: string | null; code: string; serial: string; name: string; status: string; outletDetail: string | null; legacyOrderNumber: string | null; updatedAt: string };

function useList<T>(endpoint: string) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    api<T[]>(endpoint)
      .then((data) => { if (alive) setItems(data); })
      .catch((e) => { if (alive) setError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene permiso para esta vista." : "No se pudo cargar los datos."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [endpoint]);
  return { items, error, loading };
}

// ── Marcas y tipos de dispositivo ─────────────────────────────────
export function InventoryBrands() {
  const { items, error, loading } = useList<Brand>("/api/brands");
  return <section className="mt-wrap">
    <div className="mt-hdr"><div className="mt-hdr-text"><h2><i className="bi bi-tags" /> Configuración de catálogo</h2><p>Marcas y tipos de dispositivo del sistema.</p></div></div>
    <p className="mt-note"><i className="bi bi-info-circle" /> Tipos de dispositivo y alta/edición de marcas requieren endpoints aún no expuestos. Solo lectura de marcas.</p>
    <div className="mt-card">
      <div className="mt-card-hdr"><h3><i className="bi bi-tag-fill" /> Marcas registradas ({items.length})</h3></div>
      <div style={{ overflowX: "auto" }}>
        {error ? <div className="mt-error">{error}</div>
          : loading ? <div className="mt-empty">Cargando…</div>
          : items.length === 0 ? <div className="mt-empty">No hay marcas registradas.</div>
          : <table className="mt-table"><thead><tr><th>Nombre de la marca</th></tr></thead><tbody>{items.map((b) => <tr key={b.id}><td><strong>{b.name}</strong></td></tr>)}</tbody></table>}
      </div>
    </div>
  </section>;
}

// ── Inventario físico ST ──────────────────────────────────────────
const statusClass: Record<string, string> = { Tienda: "tienda", Incinerox: "incinerox", Outlet: "outlet" };

export function PhysicalInventory() {
  const [items, setItems] = useState<PhysItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const { items: branches } = useList<Branch>("/api/branches");
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.city ?? b.name] as [string, string])), [branches]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems(await api<PhysItem[]>("/api/physical-inventory")); }
    catch (e) { setError(e instanceof ApiError && e.status === 403 ? "Tu perfil necesita el permiso inv_productos/ver." : "No se pudo cargar el inventario físico."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    return items.filter((p) => (!q || `${p.code} ${p.serial} ${p.name} ${p.legacyOrderNumber ?? ""}`.toLowerCase().includes(q)) && (!status || p.status === status));
  }, [items, text, status]);
  const count = (s: string) => items.filter((p) => p.status === s).length;

  return <section className="pi-wrap">
    <div className="pi-hdr"><h2><i className="bi bi-box-seam" /> Inventario físico en Servicio Técnico</h2><p>Auditoría y control de equipos físicos en oficina para órdenes de stock.</p></div>

    <div className="pi-kpis">
      <div className="pi-kpi"><small>Total equipos</small><strong>{items.length}</strong></div>
      <div className="pi-kpi tienda"><small>En tienda (operativo)</small><strong>{count("Tienda")}</strong></div>
      <div className="pi-kpi incinerox"><small>Incinerox (a incinerar)</small><strong>{count("Incinerox")}</strong></div>
      <div className="pi-kpi outlet"><small>Outlet (con detalle)</small><strong>{count("Outlet")}</strong></div>
    </div>

    <div className="pi-filtros">
      <div className="campo"><label>Búsqueda general</label><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Código, serie, nombre o número de orden…" /></div>
      <div className="campo"><label>Estado físico</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">— Todos —</option><option>Tienda</option><option>Incinerox</option><option>Outlet</option></select></div>
      <button type="button" onClick={() => { setText(""); setStatus(""); }}><i className="bi bi-arrow-counterclockwise" /> Limpiar</button>
    </div>

    {error ? <div className="mt-error">{error}</div>
      : loading ? <div className="pi-table-wrap"><div className="mt-empty">Cargando…</div></div>
      : <div className="pi-table-wrap"><table className="pi-table">
          <thead><tr><th>Sucursal</th><th>Orden asoc.</th><th>Código</th><th>Serie</th><th>Nombre producto</th><th>Estado físico</th><th>Detalle outlet</th><th>Actualizado</th></tr></thead>
          <tbody>{visible.length === 0 ? <tr><td colSpan={8} className="mt-empty">No hay equipos que coincidan con los filtros.</td></tr>
            : visible.map((p) => <tr key={p.id}>
                <td>{p.branchId ? branchName.get(p.branchId) ?? "—" : "—"}</td>
                <td>{p.legacyOrderNumber ? <span className="code-badge">#{p.legacyOrderNumber}</span> : "—"}</td>
                <td className="pi-mono">{p.code}</td>
                <td className="pi-mono">{p.serial}</td>
                <td>{p.name}</td>
                <td><span className={`pi-badge ${statusClass[p.status] ?? "otro"}`}>{p.status}</span></td>
                <td>{p.outletDetail || "—"}</td>
                <td>{new Date(p.updatedAt).toLocaleDateString("es-EC")}</td>
              </tr>)}</tbody>
        </table></div>}
  </section>;
}
