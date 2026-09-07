"use client";

import { useMemo, useState } from "react";
import "./tecnicos.css";

type Technician = {
  id: number;
  name: string;
  cedula: string;
  photo: string;
  scheduledOrders: number;
  repairedOrders: number;
  pendingOrders: number;
};

const technicians: Technician[] = [
  {
    id: 12,
    name: "Paul Murillo",
    cedula: "1712345678",
    photo: "",
    scheduledOrders: 50,
    repairedOrders: 30,
    pendingOrders: 20,
  },
  {
    id: 17,
    name: "Josue Romero",
    cedula: "0923456789",
    photo: "",
    scheduledOrders: 50,
    repairedOrders: 30,
    pendingOrders: 20,
  },
  {
    id: 23,
    name: "Marcos Bajaña",
    cedula: "1103456789",
    photo: "",
    scheduledOrders: 50,
    repairedOrders: 30,
    pendingOrders: 20,
  },
  {
    id: 31,
    name: "Omar Almeida",
    cedula: "1723456789",
    photo: "",
    scheduledOrders: 50,
    repairedOrders: 30,
    pendingOrders: 20,
  },
];

type FilterState = {
  technician: string;
  compliance: string;
  pending: string;
  status: string;
};

const initialFilters: FilterState = {
  technician: "todos",
  compliance: "todos",
  pending: "todos",
  status: "todos",
};

function Metric({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: string;
  label: string;
  value: string;
  tone?: "good" | "warning" | "danger" | "neutral";
}) {
  return (
    <div className={`tech-metric ${tone}`}>
      <div className="metric-label">
        <i className={icon}></i>
        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  );
}

function TechnicianCard({ tech }: { tech: Technician }) {
  const [expanded, setExpanded] = useState(false);

  const compliance =
    tech.scheduledOrders > 0
      ? Math.round(
          (tech.repairedOrders / tech.scheduledOrders) * 100
        )
      : 0;

  const pendingPercentage =
    tech.scheduledOrders > 0
      ? Math.round(
          (tech.pendingOrders / tech.scheduledOrders) * 100
        )
      : 0;

  const complianceTone =
    compliance >= 100
      ? "good"
      : compliance >= 70
        ? "warning"
        : "danger";

  const pendingTone =
    pendingPercentage === 0
      ? "good"
      : pendingPercentage <= 15
        ? "warning"
        : "danger";

  return (
    <article
      className={`technician-card ${
        expanded ? "expanded" : ""
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          setExpanded(!expanded);
        }
      }}
    >
      {/* PERFIL */}
      <div className="tech-profile">
        {tech.photo ? (
          <img
            src={tech.photo}
            alt={`Foto de ${tech.name}`}
          />
        ) : (
          <div className="tech-avatar-placeholder">
            <i className="bi bi-person-fill"></i>
          </div>
        )}

        <div className="tech-person-info">
          <h2>{tech.name}</h2>

          <p>
            <i className="bi bi-person-vcard"></i>
            C.I. {tech.cedula}
          </p>
        </div>
      </div>

      {/* INFORMACIÓN PRINCIPAL */}
      <div className="tech-summary">
        <Metric
          icon="bi bi-box-seam"
          label="Órdenes programadas"
          value={String(tech.scheduledOrders)}
        />

        <Metric
          icon="bi bi-check-circle"
          label="Órdenes reparadas"
          value={String(tech.repairedOrders)}
          tone="good"
        />

        <Metric
          icon="bi bi-exclamation-triangle"
          label="Pendientes"
          value={String(tech.pendingOrders)}
          tone={pendingTone}
        />

        <Metric
          icon="bi bi-bullseye"
          label="Cumplimiento"
          value={`${compliance}%`}
          tone={complianceTone}
        />
      </div>

      {/* BOTÓN */}
      <button
        type="button"
        className="tech-expand-button"
        aria-label={`Ver detalle de ${tech.name}`}
        onClick={() => setExpanded(!expanded)}
      >
        <i
          className={`bi bi-chevron-${
            expanded ? "up" : "down"
          }`}
        ></i>
      </button>

      {/* DETALLE ADICIONAL
          No repetimos las métricas principales.
      */}
      <div className="tech-detail">
        <div className="detail-row">
          <span>Progreso de cumplimiento</span>

          <div className="progress">
            <div
              className="progress-bar"
              style={{
                width: `${Math.min(compliance, 100)}%`,
              }}
            ></div>
          </div>

          <strong>{compliance}%</strong>
        </div>

        <div className="detail-row">
          <span>Porcentaje de órdenes pendientes</span>

          <strong
            className={
              pendingPercentage <= 15
                ? "improving"
                : "worsening"
            }
          >
            {pendingPercentage}%
          </strong>
        </div>

        <p className="tech-help">
          El cumplimiento se calcula tomando como referencia las
          órdenes reparadas frente a las órdenes programadas.
        </p>
      </div>
    </article>
  );
}

export default function TechniciansPrototype(): import("react").JSX.Element {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] =
    useState<FilterState>(initialFilters);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      const compliance =
        tech.scheduledOrders > 0
          ? (tech.repairedOrders /
              tech.scheduledOrders) *
            100
          : 0;

      const pendingPercentage =
        tech.scheduledOrders > 0
          ? (tech.pendingOrders /
              tech.scheduledOrders) *
            100
          : 0;

      /* TÉCNICO */
      if (
        filters.technician !== "todos" &&
        tech.id.toString() !== filters.technician
      ) {
        return false;
      }

      /* CUMPLIMIENTO */
      if (
        filters.compliance === "low" &&
        compliance >= 70
      ) {
        return false;
      }

      if (
        filters.compliance === "medium" &&
        (compliance < 70 || compliance >= 100)
      ) {
        return false;
      }

      if (
        filters.compliance === "high" &&
        compliance < 100
      ) {
        return false;
      }

      /* PENDIENTES */
      if (
        filters.pending === "none" &&
        tech.pendingOrders !== 0
      ) {
        return false;
      }

      if (
        filters.pending === "low" &&
        (pendingPercentage === 0 ||
          pendingPercentage > 15)
      ) {
        return false;
      }

      if (
        filters.pending === "high" &&
        pendingPercentage <= 15
      ) {
        return false;
      }

      /* ESTADO */
      if (
        filters.status === "completed" &&
        tech.pendingOrders !== 0
      ) {
        return false;
      }

      if (
        filters.status === "pending" &&
        tech.pendingOrders === 0
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const activeFilters = Object.values(filters).filter(
    (value) => value !== "todos"
  ).length;

  const updateFilter = (
    key: keyof FilterState,
    value: string
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <section className="technicians-page">

      {/* ENCABEZADO */}
      <div className="technicians-heading">

        <div>
          <p className="breadcrumb">
            Inicio / Técnicos
          </p>

          <h1>Rendimiento de técnicos</h1>

          <p>
            Control semanal de órdenes programadas,
            reparadas y pendientes.
          </p>
        </div>

        <div className="heading-actions">

          {/* FILTROS */}
          <button
            type="button"
            className={`filter-button ${
              filtersOpen ? "active" : ""
            }`}
            onClick={() =>
              setFiltersOpen(!filtersOpen)
            }
          >
            <i className="bi bi-funnel"></i>
            Filtros

            {activeFilters > 0 && (
              <span className="filter-count">
                {activeFilters}
              </span>
            )}
          </button>

          {/* EXPORTAR */}
          <button
            type="button"
            className="btn btn-primary"
          >
            <i className="bi bi-download me-2"></i>
            Exportar reporte
          </button>

        </div>
      </div>

      {/* PANEL DE FILTROS */}
      {filtersOpen && (
        <div className="filters-panel">

          <div className="filters-header">

            <div>
              <h3>
                <i className="bi bi-sliders2"></i>
                Filtrar rendimiento
              </h3>

              <p>
                Selecciona los criterios para analizar
                a los técnicos.
              </p>
            </div>

            {activeFilters > 0 && (
              <button
                type="button"
                className="clear-filters"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}

          </div>

          <div className="filters-grid">

            {/* TÉCNICO */}
            <div className="filter-group">

              <label htmlFor="technician-filter">
                Técnico
              </label>

              <select
                id="technician-filter"
                value={filters.technician}
                onChange={(event) =>
                  updateFilter(
                    "technician",
                    event.target.value
                  )
                }
              >
                <option value="todos">
                  Todos los técnicos
                </option>

                {technicians.map((tech) => (
                  <option
                    key={tech.id}
                    value={tech.id.toString()}
                  >
                    {tech.name}
                  </option>
                ))}
              </select>

            </div>

            {/* CUMPLIMIENTO */}
            <div className="filter-group">

              <label htmlFor="compliance-filter">
                Cumplimiento
              </label>

              <select
                id="compliance-filter"
                value={filters.compliance}
                onChange={(event) =>
                  updateFilter(
                    "compliance",
                    event.target.value
                  )
                }
              >
                <option value="todos">
                  Todos
                </option>

                <option value="low">
                  Menor al 70%
                </option>

                <option value="medium">
                  Entre 70% y 99%
                </option>

                <option value="high">
                  100% o más
                </option>
              </select>

            </div>

            {/* PENDIENTES */}
            <div className="filter-group">

              <label htmlFor="pending-filter">
                Pendientes
              </label>

              <select
                id="pending-filter"
                value={filters.pending}
                onChange={(event) =>
                  updateFilter(
                    "pending",
                    event.target.value
                  )
                }
              >
                <option value="todos">
                  Todos
                </option>

                <option value="none">
                  Sin pendientes
                </option>

                <option value="low">
                  Hasta 15%
                </option>

                <option value="high">
                  Más del 15%
                </option>
              </select>

            </div>

            {/* ESTADO */}
            <div className="filter-group">

              <label htmlFor="status-filter">
                Estado
              </label>

              <select
                id="status-filter"
                value={filters.status}
                onChange={(event) =>
                  updateFilter(
                    "status",
                    event.target.value
                  )
                }
              >
                <option value="todos">
                  Todos
                </option>

                <option value="completed">
                  Sin pendientes
                </option>

                <option value="pending">
                  Con pendientes
                </option>
              </select>

            </div>

          </div>
        </div>
      )}

      {/* LEYENDA */}
      <div className="technician-legend">

        <span>
          <i className="bi bi-info-circle"></i>
          Pasa el cursor sobre cada técnico para ver
          el detalle.
        </span>

        <span className="week">
          <i className="bi bi-calendar3"></i>
          Semana actual
        </span>

      </div>

      {/* RESULTADOS */}
      <div className="results-info">

        <span>
          Mostrando{" "}
          <strong>
            {filteredTechnicians.length}
          </strong>{" "}
          de{" "}
          <strong>
            {technicians.length}
          </strong>{" "}
          técnicos
        </span>

        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearFilters}
          >
            <i className="bi bi-x-circle"></i>
            Quitar filtros
          </button>
        )}

      </div>

      {/* TARJETAS */}
      <div className="technician-list">

        {filteredTechnicians.length > 0 ? (
          filteredTechnicians.map((tech) => (
            <TechnicianCard
              key={tech.id}
              tech={tech}
            />
          ))
        ) : (
          <div className="empty-results">

            <i className="bi bi-search"></i>

            <h3>
              No encontramos técnicos
            </h3>

            <p>
              No hay técnicos que coincidan con los
              filtros seleccionados.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>

          </div>
        )}

      </div>

    </section>
  );
}