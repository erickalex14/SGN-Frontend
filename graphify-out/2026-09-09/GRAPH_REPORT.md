# Graph Report - SGN-Frontend  (2026-09-09)

## Corpus Check
- 43 files · ~54,492 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 295 nodes · 386 edges · 27 communities (23 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71bbe994`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api.ts
- module-page.tsx
- compilerOptions
- identity-pages.tsx
- package.json
- devDependencies
- order-detail.tsx
- Handoff — SGN Frontend
- tecnicos/page.tsx
- Q: mira aqui esta un front que han trabajado mi equipo de front, pero le hacen falta cosas, revisa que taal esta, generale el grafo de graphify y veamos como vamos trabajando alli
- Q: Empecemos a trabajar en el front
- Q: Empecemos a trabajar en el front
- Q: Siguele rey
- Q: Sigale rey
- Q: Sigale rey
- Q: Replica el diseño del login original del SGN legacy
- Q: Migrar todas las vistas legacy manteniendo estilo visual y rehacer flujo de órdenes
- Q: Migrar todas las vistas legacy manteniendo estilo visual y rehacer flujo de órdenes
- Q: Sigue con frontend y haz backend necesario
- SGN Frontend
- app/layout.tsx
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- legacy-order-search.tsx

## God Nodes (most connected - your core abstractions)
1. `api()` - 18 edges
2. `compilerOptions` - 16 edges
3. `ApiError` - 15 edges
4. `Handoff — SGN Frontend` - 11 edges
5. `Matriz de migración legacy → Next` - 11 edges
6. `getSession()` - 10 edges
7. `include` - 7 edges
8. `scripts` - 5 edges
9. `getAccessToken()` - 5 edges
10. `useList()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `LoginPage()` --calls--> `getSession()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/session.ts
- `LegacyOrderSearch()` --calls--> `api()`  [EXTRACTED]
  src/components/legacy-order-search.tsx → src/lib/api.ts
- `OrderDetail()` --calls--> `getSession()`  [EXTRACTED]
  src/components/order-detail.tsx → src/lib/session.ts
- `CatchAllPage()` --calls--> `pageInfo()`  [EXTRACTED]
  src/app/(workspace)/[...segments]/page.tsx → src/lib/routes.ts
- `AppShell()` --calls--> `getSession()`  [EXTRACTED]
  src/components/app-shell.tsx → src/lib/session.ts

## Import Cycles
- None detected.

## Communities (27 total, 4 thin omitted)

### Community 0 - "api.ts"
Cohesion: 0.08
Nodes (28): Branch, Brand, InventoryBrands(), PhysicalInventory(), PhysItem, statusClass, useList(), Branch (+20 more)

### Community 1 - "module-page.tsx"
Cohesion: 0.11
Nodes (19): CatchAllPage(), Branch, casTypeLabels, Company, DirectoryBranches(), DirectoryCompanies(), DirectoryServiceCenters(), Field (+11 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 3 - "identity-pages.tsx"
Cohesion: 0.12
Nodes (16): LoginPage(), AppShell(), Group, groups, Item, Account, Msg, Profile (+8 more)

### Community 4 - "package.json"
Cohesion: 0.12
Nodes (15): next, dependencies, next, react, react-dom, name, private, scripts (+7 more)

### Community 5 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, @types/node (+7 more)

### Community 6 - "order-detail.tsx"
Cohesion: 0.12
Nodes (15): conditionClass, equipmentConditions, OrderLookup, Report, ReportCreate(), ReportItem, ReportList, ReportsList() (+7 more)

### Community 7 - "Handoff — SGN Frontend"
Cohesion: 0.08
Nodes (24): Archivos clave, Arquitectura y ejecución, Bases de datos, Contabilidad — clon 1:1 (bloque grande, sin API), Diagnóstico de login local, Directorios — clon 1:1, Handoff — SGN Frontend, Identidad / RRHH — clon 1:1 (+16 more)

### Community 8 - "tecnicos/page.tsx"
Cohesion: 0.25
Nodes (4): FilterState, initialFilters, Technician, technicians

### Community 9 - "Q: mira aqui esta un front que han trabajado mi equipo de front, pero le hacen falta cosas, revisa que taal esta, generale el grafo de graphify y veamos como vamos trabajando alli"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: mira aqui esta un front que han trabajado mi equipo de front, pero le hacen falta cosas, revisa que taal esta, generale el grafo de graphify y veamos como vamos trabajando alli, Source Nodes

### Community 10 - "Q: Empecemos a trabajar en el front"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Empecemos a trabajar en el front, Source Nodes

### Community 11 - "Q: Empecemos a trabajar en el front"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Empecemos a trabajar en el front, Source Nodes

### Community 12 - "Q: Siguele rey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Siguele rey, Source Nodes

### Community 13 - "Q: Sigale rey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Sigale rey, Source Nodes

### Community 14 - "Q: Sigale rey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Sigale rey, Source Nodes

### Community 15 - "Q: Replica el diseño del login original del SGN legacy"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Replica el diseño del login original del SGN legacy, Source Nodes

### Community 16 - "Q: Migrar todas las vistas legacy manteniendo estilo visual y rehacer flujo de órdenes"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Migrar todas las vistas legacy manteniendo estilo visual y rehacer flujo de órdenes, Source Nodes

### Community 17 - "Q: Migrar todas las vistas legacy manteniendo estilo visual y rehacer flujo de órdenes"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Migrar todas las vistas legacy manteniendo estilo visual y rehacer flujo de órdenes, Source Nodes

### Community 18 - "Q: Sigue con frontend y haz backend necesario"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Sigue con frontend y haz backend necesario, Source Nodes

### Community 19 - "SGN Frontend"
Cohesion: 0.40
Nodes (4): Ejecutar, Estructura, Integración requerida con Laravel, SGN Frontend

### Community 26 - "legacy-order-search.tsx"
Cohesion: 0.12
Nodes (24): AssignedOverview(), cargaColor(), Customer, Group, OrderItem, Overview, Branch, CurrentOrder (+16 more)

## Knowledge Gaps
- **162 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api()` connect `api.ts` to `module-page.tsx`, `legacy-order-search.tsx`, `identity-pages.tsx`, `order-detail.tsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `ApiError` connect `api.ts` to `module-page.tsx`, `legacy-order-search.tsx`, `identity-pages.tsx`, `order-detail.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `getSession()` connect `identity-pages.tsx` to `api.ts`, `order-detail.tsx`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _162 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07539118065433854 - nodes in this community are weakly interconnected._
- **Should `module-page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10541310541310542 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._