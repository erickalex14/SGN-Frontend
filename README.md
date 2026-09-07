# SGN Frontend

Frontend migrado a Next.js 16 (App Router) para SGN. Laravel continúa siendo el backend: autenticación, permisos, validación, consultas, archivos e informes permanecen en sus controladores hasta que exponga endpoints JSON.

## Ejecutar

1. Copia `.env.example` a `.env.local` y ajusta `NEXT_PUBLIC_API_URL`.
2. Ejecuta `npm.cmd run dev` desde esta carpeta.
3. Abre `http://localhost:3000/login` o `http://localhost:3000/dashboard`.

## Estructura

- `src/app/(workspace)/[...segments]/page.tsx`: cubre dinámicamente las URLs funcionales del sistema.
- `src/lib/routes.ts`: catálogo de rutas y títulos de los módulos de Blade.
- `src/components/app-shell.tsx`: sidebar responsive compartido.
- `src/components/module-page.tsx`: tablas, formularios, reportes y dashboard reutilizables.
- `src/lib/api.ts`: cliente JSON para Laravel con cookies de sesión.

## Integración requerida con Laravel

Las rutas web existentes retornan HTML Blade, por lo que no deben consumirse desde React como datos. Expón equivalentes bajo `/api` que devuelvan JSON y configura CORS/cookies para el dominio de Next. Luego, cada pantalla debe sustituir el estado de ejemplo por llamadas `api<T>()`, manteniendo las reglas de autorización y escritura en Laravel.

La compilación de producción se validó con `npm.cmd run build`."# SGN-Frontend" 
