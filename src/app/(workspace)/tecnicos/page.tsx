"use client";

import { useState } from "react";
import "./tecnicos.css";

type Technician = {
  id: number;
  name: string;
  cedula: string;
  photo: string;
  weeklyOrders: number;
  target: number;
  missing: number;
  repairHours: number;
  variation: number;
};

const technicians: Technician[] = [
  {
    id: 12,
    name: "Erick Chavarria",
    cedula: "1712345678",
    photo: "",
    weeklyOrders: 24,
    target: 28,
    missing: 14.3,
    repairHours: 3.4,
    variation: -12,
  },
  {
    id: 17,
    name: "Josue Romero",
    cedula: "0923456789",
    photo: "",
    weeklyOrders: 31,
    target: 30,
    missing: 0,
    repairHours: 2.8,
    variation: -18,
  },
  {
    id: 23,
    name: "Marcos Bajaña",
    cedula: "1103456789",
    photo: "",
    weeklyOrders: 19,
    target: 28,
    missing: 32.1,
    repairHours: 4.6,
    variation: 15,
  },
  {
    id: 31,
    name: "Omar Almeida",
    cedula: "1723456789",
    photo: "",
    weeklyOrders: 27,
    target: 28,
    missing: 3.6,
    repairHours: 3.1,
    variation: -8,
  },
];

function TechnicianCard({ tech }: { tech: Technician }) {
  const [expanded, setExpanded] = useState(false);

  const completed = Math.round(
    (tech.weeklyOrders / tech.target) * 100
  );

  const missingTone =
    tech.missing === 0
      ? "good"
      : tech.missing < 15
        ? "warning"
        : "danger";

  const variationGood = tech.variation <= 0;

  return (
    <article
      className={`technician-card ${expanded ? "expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onClick={() => setExpanded(!expanded)}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          setExpanded(!expanded);
        }
      }}
    >
      {/* PERFIL */}
      <div className="tech-profile">
        <div className="tech-photo">
          {tech.photo ? (
            <img src={tech.photo} alt={`Foto de ${tech.name}`} />
          ) : (
            <i className="bi bi-person-fill" />
          )}
        </div>

        <div className="tech-info">
          <h2>{tech.name}</h2>

          <p>
            <i className="bi bi-person-vcard" />
            C.I. {tech.cedula}
          </p>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="tech-metrics">
        <div className="tech-metric">
          <span>Órdenes</span>

          <strong
            className={completed >= 100 ? "good-text" : "warning-text"}
          >
            {tech.weeklyOrders}
            <small> / {tech.target}</small>
          </strong>

          <p>Meta semanal</p>
        </div>

        <div className={`tech-metric ${missingTone}`}>
          <span>Faltantes</span>

          <strong>{tech.missing}%</strong>

          <p>
            {tech.missing === 0
              ? "Meta cumplida"
              : "Pendiente de meta"}
          </p>
        </div>

        <div className="tech-metric">
          <span>Reparación</span>

          <strong>{tech.repairHours} h</strong>

          <p>Promedio por orden</p>
        </div>

        <div className="tech-metric">
          <span>Cumplimiento</span>

          <strong
            className={completed >= 100 ? "good-text" : "warning-text"}
          >
            {completed}%
          </strong>

          <div className="mini-progress">
            <div
              style={{
                width: `${Math.min(completed, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* BOTÓN */}
      <button
        type="button"
        className="tech-toggle"
        aria-label={`Ver detalle de ${tech.name}`}
        onClick={(event) => {
          event.stopPropagation();
          setExpanded(!expanded);
        }}
      >
        <i
          className={`bi bi-chevron-${expanded ? "up" : "down"}`}
        />
      </button>

      {/* DETALLE QUE APARECE AL PASAR EL CURSOR */}
      <div className="tech-detail">
        <div className="detail-content">
          <div className="detail-item">
            <span>
              <i className="bi bi-speedometer2" />
              Cumplimiento semanal
            </span>

            <strong>{completed}%</strong>
          </div>

          <div className="detail-item">
            <span>
              <i className="bi bi-clock-history" />
              Variación del tiempo
            </span>

            <strong
              className={
                variationGood ? "improving" : "worsening"
              }
            >
              <i
                className={`bi bi-arrow-${
                  variationGood ? "down" : "up"
                }-right`}
              />

              {Math.abs(tech.variation)}% vs. semana anterior
            </strong>
          </div>

          <p className="tech-help">
            <i className="bi bi-info-circle" />
            La variación compara el promedio de horas utilizadas
            para cerrar una orden con la semana anterior.
          </p>
        </div>
      </div>
    </article>
  );
}

export default function TechniciansPrototype() {
  return (
    <section className="technicians-page">

      {/* ENCABEZADO */}
      <div className="technicians-heading">

        <div>
          <p className="breadcrumb">
            Inicio / Técnicos
          </p>

          <h1>
            Rendimiento de técnicos
          </h1>

          <p>
            Control semanal de órdenes, cumplimiento y tiempos
            de reparación.
          </p>
        </div>

        <button className="btn btn-primary">
          <i className="bi bi-download me-2" />
          Exportar reporte
        </button>

      </div>

      {/* LEYENDA */}
      <div className="technician-legend">

        <span>
          <i className="bi bi-info-circle" />
          Pasa el cursor sobre cada técnico para ver el detalle.
        </span>

        <span className="week">
          <i className="bi bi-calendar3" />
          Semana actual
        </span>

      </div>

      {/* LISTA */}
      <div className="technician-list">
        {technicians.map((tech) => (
          <TechnicianCard
            key={tech.id}
            tech={tech}
          />
        ))}
      </div>

    </section>
  );
}