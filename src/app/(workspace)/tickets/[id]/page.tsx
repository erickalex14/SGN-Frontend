import { TicketPreviewDetail } from "@/components/ticket-preview-detail";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketPreviewDetail id={id} />;
}
