"use client";

import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import "./legacy-users.css";

type Operator = { id: string; userName: string; displayName: string; email: string | null; phone: string | null; affiliation: string; jobRole: string; accessProfile: string | null; serviceCenterId: string | null; isActive: boolean };
type PermissionOverride = { module: string; action: string; isAllowed: boolean };
type OperatorDetail = { operator: Operator; branchIds: string[]; permissionOverrides: PermissionOverride[] };

const affiliationLabels: Record<string, string> = { Novitec: "Personal Novitec", AuthorizedServiceCenter: "CAS autorizado", ExternalTicketRequester: "Solicitante externo" };
const jobRoleLabels: Record<string, string> = { Administrator: "Administrador", Technician: "Técnico", MasterAdministrator: "Administrador master", MasterTechnician: "Técnico master" };

export function UsersList() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OperatorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true); setError("");
    api<Operator[]>("/api/operators")
      .then(setOperators)
      .catch((e) => setError(e instanceof ApiError && e.status === 403 ? "Tu perfil no tiene el permiso usuarios/ver." : "No se pudo cargar los usuarios."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setDetailLoading(true);
    api<OperatorDetail>(`/api/operators/${selectedId}`).then(setDetail).catch(() => setDetail(null)).finally(() => setDetailLoading(false));
  }, [selectedId]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    return operators.filter((o) => !q || `${o.displayName} ${o.userName} ${o.email ?? ""}`.toLowerCase().includes(q));
  }, [operators, text]);

  return <section>
    <div className="mu-titulo"><h2><i className="bi bi-person-lines-fill" /> Gestión de usuarios</h2>
      <p className="mu-note"><i className="bi bi-info-circle" /> Alta y edición de usuarios requieren endpoints de escritura aún no disponibles. Vista de solo lectura.</p>
    </div>

    <div className="mu-container">
      <div className="mu-lista">
        <div className="mu-lista-hdr"><span>Usuarios registrados</span><span className="mu-lista-count">{operators.length}</span></div>
        <div className="mu-search"><i className="bi bi-search" /><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar por nombre, usuario o correo…" /></div>
        <div className="mu-scroll">
          {error ? <div className="mu-error">{error}</div>
            : loading ? <div className="mu-empty">Cargando…</div>
            : visible.length === 0 ? <div className="mu-empty">Sin resultados.</div>
            : visible.map((o) => <div key={o.id} className={`mu-item ${selectedId === o.id ? "activo" : ""}`} onClick={() => setSelectedId(o.id)}>
                <strong>{o.displayName || o.userName}<span className={`mu-badge ${o.isActive ? "act" : "inact"}`}>{o.isActive ? "Activo" : "Inactivo"}</span></strong>
                <span>@{o.userName} · {jobRoleLabels[o.jobRole] ?? o.jobRole}</span>
              </div>)}
        </div>
      </div>

      {detailLoading ? <div className="mu-placeholder">Cargando usuario…</div>
        : !detail ? <div className="mu-placeholder"><i className="bi bi-arrow-left-circle" style={{ fontSize: 28, display: "block", marginBottom: 8, opacity: .4 }} />Selecciona un usuario para ver su detalle.</div>
        : <div className="mu-panel">
            <div className="mu-panel-hdr"><h3>{detail.operator.displayName || detail.operator.userName}</h3><span className={`mu-badge ${detail.operator.isActive ? "act" : "inact"}`}>{detail.operator.isActive ? "Activo" : "Inactivo"}</span></div>
            <dl className="mu-dl">
              <div><dt>Usuario</dt><dd>@{detail.operator.userName}</dd></div>
              <div><dt>Afiliación</dt><dd>{affiliationLabels[detail.operator.affiliation] ?? detail.operator.affiliation}</dd></div>
              <div><dt>Rol laboral</dt><dd>{jobRoleLabels[detail.operator.jobRole] ?? detail.operator.jobRole}</dd></div>
              <div><dt>Perfil de acceso</dt><dd>{detail.operator.accessProfile ?? "—"}</dd></div>
              <div><dt>Correo</dt><dd>{detail.operator.email ?? "—"}</dd></div>
              <div><dt>Teléfono</dt><dd>{detail.operator.phone ?? "—"}</dd></div>
              <div><dt>Sucursales</dt><dd>{detail.branchIds.length}</dd></div>
              <div><dt>CAS</dt><dd>{detail.operator.serviceCenterId ? "Vinculado" : "—"}</dd></div>
            </dl>
            <div className="mu-sec">
              <h4>Excepciones de permiso ({detail.permissionOverrides.length})</h4>
              {detail.permissionOverrides.length === 0 ? <p className="mu-empty" style={{ padding: 12 }}>Sin excepciones personales; usa los permisos de su perfil.</p>
                : <table className="mu-perm-table"><thead><tr><th>Módulo</th><th>Acción</th><th>Permitido</th></tr></thead><tbody>{detail.permissionOverrides.map((perm, i) => <tr key={i}><td>{perm.module}</td><td>{perm.action}</td><td className={perm.isAllowed ? "mu-yes" : "mu-no"}>{perm.isAllowed ? "Sí" : "No"}</td></tr>)}</tbody></table>}
            </div>
          </div>}
    </div>
  </section>;
}
