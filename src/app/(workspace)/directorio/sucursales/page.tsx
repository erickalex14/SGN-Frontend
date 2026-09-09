import { LegacyCatalog } from "@/components/legacy-catalog";
export default function BranchesPage() { return <LegacyCatalog eyebrow="Directorio corporativo" title="Sucursales" description="Administra las sucursales y puntos de atención de Novitec." createLabel="Crear sucursal" columns={["Código", "Sucursal", "Ciudad", "Estado"]} />; }
