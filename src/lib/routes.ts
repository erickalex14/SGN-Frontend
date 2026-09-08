export type PageKind = "form" | "detail" | "report" | "list";
export type RouteDefinition = { title: string; group: string; kind?: PageKind };

export const routeDefinitions: Record<string, RouteDefinition> = {
  dashboard: { title: "Dashboard", group: "Principal" },
  "operaciones/ordenes/crear": { title: "Crear orden de servicio", group: "Órdenes", kind: "form" },
  "operaciones/ordenes-disponibles": { title: "Órdenes disponibles", group: "Órdenes" },
  "operaciones/garantias-pendientes": { title: "Garantías pendientes", group: "Órdenes" },
  "operaciones/mis-ordenes": { title: "Mis órdenes", group: "Órdenes" },
  "operaciones/ordenes-asignadas": { title: "Órdenes asignadas", group: "Órdenes" },
  "operaciones/ordenes/buscar": { title: "Buscar órdenes", group: "Órdenes" },
  "operaciones/preordenes": { title: "Preórdenes", group: "Órdenes" },
  "operaciones/informes/crear": { title: "Crear informe técnico", group: "Documentación", kind: "form" },
  "operaciones/mis-informes": { title: "Mis informes", group: "Documentación" },
  "operaciones/informes/buscar": { title: "Buscar informes técnicos", group: "Documentación" },
  "operaciones/presupuestos": { title: "Presupuestos", group: "Documentación" },
  "operaciones/mis-solicitudes-nc": { title: "Mis solicitudes NC", group: "Documentación", kind: "form" },
  "operaciones/gestion-nc": { title: "Gestión de notas de crédito", group: "Documentación" },
  "operaciones/mis-solicitudes-bodega": { title: "Solicitar repuesto", group: "Documentación", kind: "form" },
  "operaciones/bodega-solicitudes": { title: "Solicitudes a bodega", group: "Documentación" },
  "operaciones/reportes": { title: "Reportes", group: "Documentación", kind: "report" },
  "inventario/productos": { title: "Catálogo de productos", group: "Inventario" },
  "inventario/marcas": { title: "Marcas y tipos de dispositivo", group: "Inventario" },
  "inventario/repuestos": { title: "Catálogo de repuestos", group: "Inventario" },
  "operaciones/listas-compra": { title: "Listas de compra", group: "Inventario" },
  "directorio/empresas": { title: "Empresas", group: "Directorios" },
  "directorio/cas": { title: "Centros autorizados (CAS)", group: "Directorios" },
  "directorio/sucursales": { title: "Sucursales Novitec", group: "Directorios" },
  "directorio/sucursales-cliente": { title: "Sucursales Novicompu", group: "Directorios" },
  "usuarios/crear": { title: "Crear usuario", group: "Accesos", kind: "form" },
  usuarios: { title: "Usuarios", group: "Accesos" }, grupos: { title: "Grupos de acceso", group: "Accesos" },
  "mi-cuenta": { title: "Mi cuenta", group: "Perfil", kind: "form" }, "mis-actividades": { title: "Mis actividades diarias", group: "Perfil" },
  "gestion/actividades-tecnicos": { title: "Control de actividades", group: "Perfil" },
  "nomina/mis-datos": { title: "Mis datos personales y nómina", group: "Nómina", kind: "form" }, nomina: { title: "Gestión de nómina", group: "Nómina" },
  "contabilidad/caja-chica": { title: "Caja chica", group: "Contabilidad" }, "contabilidad/caja-chica/admin": { title: "Administración de caja chica", group: "Contabilidad" },
  "contabilidad/caja-general": { title: "Caja general", group: "Contabilidad" }, "contabilidad/recuento-b2b": { title: "Recuento B2B", group: "Contabilidad" },
  "contabilidad/facturas": { title: "Facturación electrónica", group: "Contabilidad" }, "contabilidad/reportes": { title: "Reportes contables", group: "Contabilidad", kind: "report" },
  "tickets/mis-tickets": { title: "Mis tickets", group: "Soporte" }, "tickets/crear": { title: "Crear ticket", group: "Soporte", kind: "form" },
  "tickets/gestion": { title: "Gestión de tickets", group: "Soporte" }, "tickets/solicitantes": { title: "Solicitantes", group: "Soporte" },
  "tickets/mi-perfil": { title: "Mi perfil de soporte", group: "Soporte", kind: "form" },
};

export function pageInfo(segments: string[]) {
  const key = segments.join("/");
  return routeDefinitions[key] ?? { title: key.split("/").at(-1)?.replaceAll("-", " ") || "SGN", group: "Sistema", kind: "detail" as const };
}
