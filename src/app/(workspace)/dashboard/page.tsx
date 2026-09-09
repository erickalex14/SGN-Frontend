import { DashboardOrderMetrics } from "@/components/dashboard-order-metrics";
import { LegacyDashboard } from "@/components/legacy-dashboard";

export default function DashboardPage() {
  return <><LegacyDashboard /><DashboardOrderMetrics /></>;
}
