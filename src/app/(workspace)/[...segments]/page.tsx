import { ModulePage } from "@/components/module-page";
import { pageInfo } from "@/lib/routes";

export default async function CatchAllPage({ params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  return <ModulePage info={pageInfo(segments)} route={segments.join("/")} />;
}