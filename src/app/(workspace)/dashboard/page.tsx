"use client";

import {
  BarChart3,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Headphones,
  Package,
  Scissors,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

import "./dashboard.css";

const technicians = [
  { name: "Dylan R.", orders: 1103, results: 431, pending: 30, resolution: 39 },
  { name: "William C.", orders: 459, results: 40, pending: 27, resolution: 7 },
  { name: "Argello P.", orders: 482, results: 51, pending: 55, resolution: 0 },
  { name: "Jeff Rz.", orders: 279, results: 52, pending: 19, resolution: 19 },
  { name: "Erick M.", orders: 271, results: 244, pending: 16, resolution: 90 },
  { name: "Javier S.", orders: 260, results: 123, pending: 28, resolution: 47 },
  { name: "José P.", orders: 299, results: 141, pending: 7, resolution: 70 },
  { name: "Franklin B.", orders: 254, results: 185, pending: 9, resolution: 73 },
];

const weeklyOrders = [22, 40, 27, 59, 34, 48, 65];

const equipment = [62, 45, 53, 31, 25];

const branches = [
  { name: "Norte Guayaquil", value: 100 },
  { name: "Norte CEC", value: 62 },
  { name: "Norte Man", value: 25 },
];

const cases = [
  { name: "WOCEECUADOR", value: 100 },
  { name: "DISEÑO", value: 76 },
  { name: "ESPECIAL", value: 62 },
  { name: "FASTERTECH", value: 60 },
  { name: "COMPUTACIÓN", value: 55 },
];

function StatCard({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon}</div>

      <div className="stat-content">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-card ${className}`}>
      <div className="card-title">
        {icon}
        <span>{title}</span>
      </div>

      {children}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <main className="dashboard-page">

      {/* ENCABEZADO */}
      <section className="dashboard-header">
        <div>
          <h1>Buenas tardes, Erick Chavarrea</h1>

          <p>
            Panel operativo con indicadores y gráficos en tiempo real.
          </p>

          <button className="branch-button">
            <ShieldCheck size={13} />
            VISTA GLOBAL DESACTIVADA
          </button>
        </div>
      </section>

      {/* TARJETAS SUPERIORES */}
      <section className="stats-grid">

        <StatCard
          icon={<ClipboardList size={19} />}
          value="5154"
          label="ÓRDENES TOTALES"
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          value="71"
          label="INGRESADAS HOY"
          className="green"
        />

        <StatCard
          icon={<Scissors size={19} />}
          value="230"
          label="TÉCNICOS"
          className="orange"
        />

        <StatCard
          icon={<Users size={19} />}
          value="3092"
          label="CLIENTES"
          className="purple"
        />

        <StatCard
          icon={<Store size={19} />}
          value="3"
          label="SUCURSALES"
          className="red"
        />

        <StatCard
          icon={<ShieldCheck size={19} />}
          value="17/150"
          label="CENTROS CA 8 (OT)"
          className="cyan"
        />

        <StatCard
          icon={<Calculator size={19} />}
          value="3"
          label="TOTALES"
          className="blue"
        />

      </section>

      {/* FILA DE GRÁFICOS */}
      <section className="charts-row">

        {/* ÓRDENES */}
        <Card
          title="ÓRDENES ÚLTIMOS 7 DÍAS"
          icon={<BarChart3 size={15} />}
        >
          <div className="line-chart">

            <div className="chart-y">
              <span>70</span>
              <span>55</span>
              <span>40</span>
              <span>25</span>
              <span>10</span>
            </div>

            <div className="line-area">
              <div className="grid-lines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              <svg
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
                className="line-svg"
              >
                <defs>
                  <linearGradient
                    id="areaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#4f8df7"
                      stopOpacity="0.28"
                    />

                    <stop
                      offset="100%"
                      stopColor="#4f8df7"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0,125
                     C50,105 65,145 110,112
                     C155,80 180,145 220,150
                     C260,155 280,130 310,95
                     C350,48 365,15 395,22
                     C435,30 440,75 475,70
                     C520,63 545,90 600,55
                     L600,180
                     L0,180 Z"
                  fill="url(#areaGradient)"
                />

                <path
                  d="M0,125
                     C50,105 65,145 110,112
                     C155,80 180,145 220,150
                     C260,155 280,130 310,95
                     C350,48 365,15 395,22
                     C435,30 440,75 475,70
                     C520,63 545,90 600,55"
                  fill="none"
                  stroke="#4f8df7"
                  strokeWidth="3"
                />
              </svg>

              <div className="chart-days">
                <span>03/09</span>
                <span>04/09</span>
                <span>05/09</span>
                <span>06/09</span>
                <span>07/09</span>
                <span>08/09</span>
                <span>09/09</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ESTADO DE ÓRDENES */}
        <Card
          title="ESTADO DE ÓRDENES"
          icon={<Clock3 size={15} />}
        >
          <div className="donut-container">

            <div
              className="donut"
              style={{
                background:
                  "conic-gradient(#7658e8 0deg 135deg, #8b9aad 135deg 230deg, #10b981 230deg 315deg, #f59e0b 315deg 360deg)",
              }}
            >
              <div className="donut-center" />
            </div>

            <div className="legend">
              <span>
                <i className="purple-dot" />
                Finalizado
              </span>

              <span>
                <i className="gray-dot" />
                Nota de Crédito
              </span>

              <span>
                <i className="green-dot" />
                Entregado
              </span>

              <span>
                <i className="orange-dot" />
                Pendiente
              </span>

              <span>
                <i className="blue-dot" />
                En proceso
              </span>
            </div>
          </div>
        </Card>

        {/* EQUIPOS */}
        <Card
          title="TIPOS DE EQUIPO"
          icon={<Package size={15} />}
        >
          <div className="bar-chart">

            {equipment.map((value, index) => (
              <div className="bar-item" key={index}>
                <div
                  className="bar"
                  style={{ height: `${value * 1.7}px` }}
                />
              </div>
            ))}

          </div>

          <div className="bar-labels">
            <span>TV</span>
            <span>Audio</span>
            <span>Video</span>
            <span>Otros</span>
            <span>PC</span>
          </div>
        </Card>

      </section>

      {/* SEGUNDA FILA */}
      <section className="middle-grid">

        {/* RENDIMIENTO */}
        <Card
          title="RENDIMIENTO POR TÉCNICO"
          icon={<Users size={15} />}
          className="technicians-card"
        >

          <div className="technician-table">

            <div className="table-header">
              <span>TÉCNICO</span>
              <span>ORDENES</span>
              <span>RESULTAS</span>
              <span>PENDIENTES</span>
              <span>RESOLUCIÓN</span>
            </div>

            {technicians.map((tech) => (
              <div className="tech-row" key={tech.name}>

                <span>{tech.name}</span>

                <span>
                  <b className="badge blue">
                    {tech.orders}
                  </b>
                </span>

                <span>
                  <b className="badge green-badge">
                    {tech.results}
                  </b>
                </span>

                <span>
                  <b className="badge orange-badge">
                    {tech.pending}
                  </b>
                </span>

                <span className="resolution">
                  <div className="progress">
                    <div
                      style={{
                        width: `${tech.resolution}%`,
                      }}
                    />
                  </div>

                  <small>{tech.resolution}%</small>
                </span>

              </div>
            ))}

          </div>
        </Card>

        {/* REPUESTOS */}
        <Card
          title="ESTADO DE REPUESTOS"
          icon={<Package size={15} />}
        >
          <div className="donut-container parts">

            <div
              className="donut parts-donut"
              style={{
                background:
                  "conic-gradient(#66758b 0deg 150deg, #10b981 150deg 235deg, #ef4444 235deg 285deg, #f59e0b 285deg 325deg, #7658e8 325deg 360deg)",
              }}
            >
              <div className="donut-center" />
            </div>

            <div className="legend parts-legend">

              <span>
                <i className="gray-dot" />
                No requerido
              </span>

              <span>
                <i className="green-dot" />
                Con Stock
              </span>

              <span>
                <i className="red-dot" />
                Requerido
              </span>

              <span>
                <i className="orange-dot" />
                Sin Stock
              </span>

              <span>
                <i className="purple-dot" />
                En espera
              </span>

            </div>

          </div>
        </Card>

      </section>

      {/* TERCERA FILA */}
      <section className="bottom-grid">

        {/* SUCURSALES */}
        <Card
          title="TOP SUCURSALES POR ÓRDENES"
          icon={<Store size={15} />}
        >
          <div className="horizontal-bars">

            {branches.map((branch) => (
              <div className="horizontal-row" key={branch.name}>

                <span>{branch.name}</span>

                <div className="horizontal-track">
                  <div
                    style={{
                      width: `${branch.value}%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>
        </Card>

        {/* CAS */}
        <Card
          title="DISTRIBUCIÓN DE ÓRDENES EN CAS"
          icon={<ShieldCheck size={15} />}
        >
          <div className="horizontal-bars cas">

            {cases.map((item) => (
              <div className="horizontal-row" key={item.name}>

                <span>{item.name}</span>

                <div className="horizontal-track">
                  <div
                    style={{
                      width: `${item.value}%`,
                    }}
                  />
                </div>

              </div>
            ))}

          </div>
        </Card>

      </section>

    </main>
  );
}