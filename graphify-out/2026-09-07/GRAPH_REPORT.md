# Graph Report - SGN-Frontend  (2026-09-07)

## Corpus Check
- 25 files · ~43,517 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 157 nodes · 171 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9e163e2c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- module-page.tsx
- compilerOptions
- include
- package.json
- tecnicos/page.tsx
- Q: mira aqui esta un front que han trabajado mi equipo de front, pero le hacen falta cosas, revisa que taal esta, generale el grafo de graphify y veamos como vamos trabajando alli
- order-detail.tsx
- SGN Frontend
- app/layout.tsx
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- Q: Empecemos a trabajar en el front
- Q: Empecemos a trabajar en el front
- app-shell.tsx
- Q: Siguele rey
- Q: Sigale rey

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `api()` - 7 edges
3. `include` - 7 edges
4. `getSession()` - 6 edges
5. `scripts` - 5 edges
6. `ApiError` - 5 edges
7. `AppShell()` - 4 edges
8. `getAccessToken()` - 4 edges
9. `lib` - 4 edges
10. `SGN Frontend` - 4 edges

## Surprising Connections (you probably didn't know these)
- `CatchAllPage()` --calls--> `pageInfo()`  [EXTRACTED]
  src/app/(workspace)/[...segments]/page.tsx → src/lib/routes.ts
- `LoginPage()` --calls--> `getSession()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/session.ts
- `LoginPage()` --calls--> `saveSession()`  [EXTRACTED]
  src/app/login/page.tsx → src/lib/session.ts
- `AppShell()` --calls--> `clearSession()`  [EXTRACTED]
  src/components/app-shell.tsx → src/lib/session.ts
- `AppShell()` --calls--> `getSession()`  [EXTRACTED]
  src/components/app-shell.tsx → src/lib/session.ts

## Import Cycles
- None detected.

## Communities (21 total, 4 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, @types/node (+7 more)

### Community 1 - "module-page.tsx"
Cohesion: 0.18
Nodes (8): CatchAllPage(), columns, demoRows, ModulePage(), pageInfo(), PageKind, RouteDefinition, routeDefinitions

### Community 2 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 3 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 4 - "package.json"
Cohesion: 0.12
Nodes (15): next, dependencies, next, react, react-dom, react, name, private (+7 more)

### Community 5 - "tecnicos/page.tsx"
Cohesion: 0.25
Nodes (4): FilterState, initialFilters, Technician, technicians

### Community 6 - "Q: mira aqui esta un front que han trabajado mi equipo de front, pero le hacen falta cosas, revisa que taal esta, generale el grafo de graphify y veamos como vamos trabajando alli"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: mira aqui esta un front que han trabajado mi equipo de front, pero le hacen falta cosas, revisa que taal esta, generale el grafo de graphify y veamos como vamos trabajando alli, Source Nodes

### Community 7 - "order-detail.tsx"
Cohesion: 0.17
Nodes (13): Order, OrderDetail(), PartItem, Quote, Workflow, Order, OrderList, priorityLabel (+5 more)

### Community 8 - "SGN Frontend"
Cohesion: 0.40
Nodes (4): Ejecutar, Estructura, Integración requerida con Laravel, SGN Frontend

### Community 16 - "Q: Empecemos a trabajar en el front"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Empecemos a trabajar en el front, Source Nodes

### Community 17 - "Q: Empecemos a trabajar en el front"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Empecemos a trabajar en el front, Source Nodes

### Community 18 - "app-shell.tsx"
Cohesion: 0.26
Nodes (9): LoginPage(), AppShell(), Group, groups, Item, clearSession(), getSession(), saveSession() (+1 more)

### Community 19 - "Q: Siguele rey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Siguele rey, Source Nodes

### Community 20 - "Q: Sigale rey"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Sigale rey, Source Nodes

## Knowledge Gaps
- **82 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `compilerOptions` connect `compilerOptions` to `include`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._