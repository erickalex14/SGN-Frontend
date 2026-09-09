import { LegacyCatalog } from "@/components/legacy-catalog";
export default function CustomerBranchesPage() { return <LegacyCatalog eyebrow="Directorio corporativo" title="Sucursales de cliente" description="Administra las tiendas y sucursales de clientes." createLabel="Crear sucursal de cliente" columns={["Código", "Tienda", "Empresa", "Estado"]} />; }
