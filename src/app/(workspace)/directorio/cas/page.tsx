import { LegacyCatalog } from "@/components/legacy-catalog";
export default function CasPage() { return <LegacyCatalog eyebrow="Directorio corporativo" title="Centros autorizados (CAS)" description="Gestiona los centros de asistencia autorizados." createLabel="Registrar CAS" columns={["Código", "Centro", "Ciudad", "Estado"]} />; }
