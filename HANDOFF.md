# Handoff — SGN Frontend

Última actualización: 2026-09-09

## Punto de continuación

El frontend Next.js ya consume el backend `.NET` local y cubre el núcleo operativo de órdenes y tickets. La siguiente sesión debe continuar con el endurecimiento del flujo de órdenes: validar evidencias obligatorias antes de cada transición y reemplazar gradualmente las vistas genéricas que todavía muestran datos de demostración.

## Arquitectura y ejecución

- Frontend: Next.js 16, React 19 y TypeScript.
- Backend esperado: `NuevoSgn.Api`, por defecto en `http://localhost:5285`.
- Base de datos: el frontend nunca conecta directamente a PostgreSQL; consume el API local, que apunta a `sgn_dev` mediante User Secrets.
- Sesión: JWT almacenado por `src/lib/session.ts` y enviado por `src/lib/api.ts`.
- Enrutamiento funcional: catch-all en `src/app/(workspace)/[...segments]/page.tsx`, catálogo en `src/lib/routes.ts` y resolución de vistas en `src/components/module-page.tsx`.

Arranque:

```powershell
cd "C:\ruta\SGN-Frontend"
Copy-Item .env.example .env.local
npm install
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5285
```

Comprobaciones previas:

```text
http://localhost:5285/health
http://localhost:5285/health/ready
http://localhost:3000/login
```

Si cambia `.env.local`, reiniciar Next.js. No guardar contraseñas, cadenas de conexión ni claves JWT en este repositorio.

## Implementado y conectado al API

### Identidad y navegación

- Login visualmente alineado con SGN Legacy.
- Inicio y cierre de sesión con JWT.
- Layout responsive, sidebar y encabezado basados en la identidad visual original.
- Visibilidad básica del menú por `jobRole` y `affiliation`.
- CAS oculta acciones administrativas y Nota de Crédito; el backend sigue siendo la autoridad definitiva.

### Órdenes

- Creación de orden con cliente/equipo existente o creación rápida desde modales.
- Tipos y prioridad del nuevo flujo: cliente final, mayorista, cliente externo, stock y autoconsumo.
- Carga de múltiples fotos de recepción y factura PDF cuando aplica garantía.
- Idempotencia estable para creación, ingreso directo y evidencias.
- Reintento seguro: conserva `pendingOrderId` para no duplicar una orden si falla una evidencia.
- Bandejas conectadas: garantía documental, disponibles, mis órdenes, asignadas, atención al cliente, repuestos, NC y entregas.
- Detalle operativo con decisiones documentales/técnicas, revisión física, reparación, solicitud consolidada de repuestos, cotización, NC y cierre de entrega.
- Evidencias visibles y descargables mediante endpoint autenticado.
- Búsqueda híbrida: órdenes nuevas en PostgreSQL y fallback de órdenes legacy de solo lectura.

### Tickets

- Listado propio y gestión administrativa.
- Creación, detalle, mensajes, estado, asignación y adjuntos.
- Todos los tickets nuevos y migrados se consumen desde PostgreSQL.

## Vistas todavía provisionales

`ModulePage` usa `EntryForm` o `ListView` genéricos para rutas que aún no tienen componente real. Entre ellas:

- Informes técnicos y presupuestos.
- Catálogos de productos, marcas y repuestos.
- Directorios de empresas, CAS y sucursales.
- Usuarios y grupos de acceso.
- Nómina, actividades, contabilidad y reportes.
- Preórdenes y listas de compra.
- Dashboard: conserva el estilo legacy, pero varios indicadores siguen sin endpoint real.

No considerar esas pantallas terminadas porque la ruta exista en `routes.ts`.

## Matriz de migración legacy → Next

Objetivo: clonar CSS de **todas** las vistas Blade de `SGN LEGACY/novitec-sgn/resources/views`. Solo órdenes, informes y lo ligado al flujo nuevo se transforman al flujo V2; el resto es clon 1:1.

Leyenda: ✅ hecho · ⚠️ parcial · ❌ pendiente · API✅/API❌ disponibilidad de endpoint JSON.

### Shell / sistema
| Legacy | Ruta Next | Estado |
|---|---|---|
| `layouts/app` | `app-shell.tsx` | ✅ |
| `auth/login` | `app/login` | ✅ |
| `dashboard/index` | `legacy-dashboard.tsx` | ✅ (indicadores parciales sin endpoint) |
| `errors/*` | Next nativo | N/A |
| `emails/*` | — | N/A (plantillas server-side) |

### Órdenes — transformar a flujo V2
| Legacy | Ruta Next | Estado |
|---|---|---|
| `ordenes/crear` | `operaciones/ordenes/crear` (`legacy-order-create`) | ✅ V2 |
| `ordenes/buscar` | `operaciones/ordenes/buscar` (`legacy-order-search`) | ✅ V2 (lookup exacto + listado filtrable) |
| `ordenes/editar` | `operaciones/ordenes/{id}` (`order-detail`) | ✅ V2 |
| `ordenes/editar_empresa` | — | ❌ órdenes de empresa no modeladas en V2 |
| `mis_ordenes/index` | `operaciones/mis-ordenes` (`technical-queue`) | ✅ V2 (KPIs por bucket) |
| `ordenes_asignadas/index` | `operaciones/ordenes-asignadas` (`assigned-overview`) | ✅ V2 + endpoint `GET /api/orders/assigned-overview` |
| `ordenes/imprimir` `imprimir_empresa` | — | ❌ falta endpoint + vista impresión OT |
| `ordenes/recuperar` | — | ❌ falta endpoint análisis PDF |
| `preordenes/index` `reporte` | `operaciones/preordenes` | ❌ sin endpoint |

### Informes / NC / repuestos — flujo V2
| Legacy | Estado | Falta |
|---|---|---|
| `informes/{buscar,crear,mis}` | ✅ `informes-pages.tsx` `ReportsList`/`ReportCreate` + endpoints `GET /api/reports?mine&q&from&to`, `GET /api/reports/{id}`, `GET /api/orders/{id}/reports`. `/workflow` ya incluía `reports`; `order-detail` ahora los muestra y permite crearlos inline |
| `informes/{index (admin),imprimir}` | ❌ | falta ruta admin (lista global — endpoint ya sirve sin `mine`) e impresión |
| Informes: lista no trae cliente/equipo | ⚠️ | `TechnicalReportListItem` solo trae `orderNumber`; falta join a customer/equipment si se quiere paridad |
| `notas_credito/{admin,tecnico,imprimir,imprimir_reporte}` | ⚠️ | decisión/solicitud NC vive en `order-detail` + cola `credit-notes`; faltan vistas dedicadas admin/técnico + impresión |
| `solicitudes_repuestos/{admin,tecnico,imprimir}` | ⚠️ | solicitud/decisión en `order-detail` + cola `parts`; faltan vistas dedicadas + impresión |
| `presupuestos/{index,imprimir}` | ❌ | cotización en `order-detail`; vista dedicada e impresión no |

### Directorios — clon 1:1
| Legacy | API | Vista |
|---|---|---|
| `directory/cas` | API✅ `/api/service-centers` (GET+POST) | ✅ `directory-pages.tsx` `DirectoryServiceCenters` (lista + alta; sin edición) |
| `directory/empresas` | API⚠️ solo GET | ✅ `DirectoryCompanies` (solo lectura) |
| `directory/sucursales` | API✅ `/api/branches` (GET+POST) | ✅ `DirectoryBranches` (lista + alta; sin edición PUT) |
| `directory/sucursales_cliente` | API❌ | ❌ |

### Inventario — clon 1:1 (productos/repuestos esperan MBA)
| Legacy | Estado |
|---|---|
| `inventory/marcas` | ✅ `inventory-pages.tsx` `InventoryBrands` (tabla de marcas, `GET /api/brands`, solo lectura; falta "tipos de dispositivo" y alta/edición) |
| `operations/inventario_fisico` | ✅ `PhysicalInventory` (KPIs + tabla + filtros, `GET /api/physical-inventory`; falta detalle con auditoría y export Excel) |
| `inventory/{productos,repuestos,repuestos/auditoria,repuestos/imprimir_reporte,listas_compra,...}` | ❌ stub — esperan MBA |

### Identidad / RRHH — clon 1:1
| Legacy | API | Vista |
|---|---|---|
| `identity/usuarios/{crear,modificar}` | API⚠️ `/api/operators` GET+detalle, falta escritura | ✅ `users-page.tsx` `UsersList` (listado + panel: afiliación, rol, perfil, excepciones de permiso). Solo lectura; ruta `usuarios`. Falta alta/edición y toggle activo |
| `identity/grupos` | API⚠️ `/api/access-profiles` solo GET | ✅ `identity-pages.tsx` `AccessProfiles` (lista + modal permisos, solo lectura) |
| `identity/mi_cuenta` | API✅ `/api/account` (GET+PUT+PUT password) | ✅ `MyAccount` (perfil, contraseña, logout) |
| `identity/actividades/{index,admin,historial}` | API❌ | ❌ |
| `identity/nomina/{admin,mis_datos,excel_rol_pagos,imprimir_solicitud_vacaciones}` | API❌ | ❌ |

### Contabilidad — clon 1:1 (bloque grande, sin API)
`accounting/*` (caja chica admin/gestión, caja general, recuento B2B, facturas index/show, reportes b2b/caja_chica/caja_general/index/kpis, recibos y arqueos de impresión) — ❌ sin endpoints.

### Operaciones varias — clon 1:1
| Legacy | API | Vista |
|---|---|---|
| `operations/bitacora/index` | API❌ | ❌ |
| `operations/inventario_fisico/index` | API✅ `/api/physical-inventory` (lectura) | ❌ stub |
| `operations/precios/index` | API❌ | ❌ |
| `operations/reportes/{index,imprimir,tecnico}` | API❌ | ❌ |

### Tickets — clon 1:1 (evolución de flujo posterior)
| Legacy | Estado |
|---|---|
| `tickets/{mis_tickets,gestion,crear,ver}` | ✅ |
| `tickets/atender` | ⚠️ revisar si `gestion` lo cubre |
| `tickets/{auditoria,mi_perfil,solicitantes}` | ❌ stub |

### Bases de datos
- `ConnectionStrings:PrimaryPostgres` (user-secrets) → `sgn_dev`. Verificado vivo (`/health/ready`). Única fuente de escritura.
- `ConnectionStrings:LegacyMySql` (user-secrets) → `novitecdb_pruebas` (backup al día de prod). Solo lectura para órdenes legacy vía `LegacyOrderReader` e importadores.
- Riesgo: la cadena MySQL usa `root`; `MIGRATION_LEGACY_DATA.md` exige cuenta exclusiva con permiso `SELECT` para producción.
- Importadores idempotentes ya ejecutados: identidad, directorio, tickets, inventario físico ST. Productos y stock de repuestos esperan MBA.

## Próximo bloque recomendado

1. Crear una matriz backend/frontend de evidencia requerida por transición.
2. Impedir cierre de entrega sin foto y memo, tanto en API como en interfaz.
3. Exigir informe/adjuntos cuando el técnico niegue garantía física.
4. Mostrar tipos de evidencia con etiquetas en español, fecha y usuario que cargó el archivo.
5. Ejecutar pruebas completas con un usuario por rol: recepción, técnico, supervisor/administrador, atención al cliente y CAS.
6. Luego migrar informes técnicos, porque intervienen directamente en la denegación de garantía.

## Riesgos y decisiones pendientes

- Los permisos visuales del menú usan nombres de rol; nunca sustituyen autorización del backend.
- `sessionStorage/localStorage` con JWT requiere mantener especial cuidado frente a XSS; evaluar cookies HttpOnly antes de producción.
- Algunas acciones generan un UUID al hacer clic. La creación de órdenes ya conserva claves estables, pero conviene revisar las demás mutaciones para reintentos tras cortes de red.
- Las fotos legacy deben conservarse físicamente y reconciliarse antes de producción. El frontend solo puede descargar archivos que existan en el almacenamiento configurado del backend.
- El README todavía contiene referencias antiguas a Laravel y debe actualizarse cuando se cierre el onboarding definitivo.
- MBA 3 queda como integración futura para productos e inventario de repuestos.

## Diagnóstico de login local

El API espera exactamente:

```json
{"userName":"USUARIO","password":"CONTRASEÑA"}
```

Prueba directa:

```cmd
curl -i -X POST http://localhost:5285/api/auth/login -H "Content-Type: application/json" -d "{\"userName\":\"USUARIO\",\"password\":\"CONTRASEÑA\"}"
```

- `200`: backend y credenciales correctos; revisar `NEXT_PUBLIC_API_URL` y reiniciar Next.
- `401`: revisar existencia exacta, `IsActive` y `PasswordHash` del operador migrado.
- `429`: esperar un minuto por el limitador de login.
- `/health` correcto y `/health/ready` fallido: conexión o acceso a PostgreSQL.

En CMD no usar `Jwt:Key = $jwtKey`: eso guarda el texto literal. La clave de desarrollo debe contener al menos 32 bytes y configurarse con `dotnet user-secrets`.

## Archivos clave

- `src/lib/api.ts`: cliente HTTP JSON y descarga binaria autenticada.
- `src/lib/session.ts`: sesión local.
- `src/lib/routes.ts`: catálogo de rutas.
- `src/components/module-page.tsx`: selector principal de vistas.
- `src/components/app-shell.tsx`: navegación y visibilidad por rol.
- `src/components/legacy-order-create.tsx`: alta de órdenes.
- `src/components/technical-queue.tsx`: bandejas del flujo.
- `src/components/order-detail.tsx`: ciclo de vida de órdenes y evidencias.
- `src/components/legacy-order-search.tsx`: búsqueda nueva/legacy.
- `src/components/legacy-tickets.tsx`, `ticket-create.tsx`, `ticket-detail.tsx`: módulo de tickets.
- `graphify-out/graph.json`: grafo estructural para próximas consultas.
- `graphify-out/GRAPH_REPORT.md`: reporte navegable del grafo.

## Validación al entregar este handoff

```powershell
npm run build
```

Última compilación conocida antes de actualizar este documento: exitosa con Next.js 16.3.4.
