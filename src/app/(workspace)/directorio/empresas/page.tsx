import { LegacyCatalog } from "@/components/legacy-catalog";
export default function CompaniesPage() { return <LegacyCatalog eyebrow="Directorio corporativo" title="Empresas" description="Administra las empresas registradas en el sistema." createLabel="Crear empresa" columns={["Código", "Empresa", "RUC", "Estado"]} />; }
