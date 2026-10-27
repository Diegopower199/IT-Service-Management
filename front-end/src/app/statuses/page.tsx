import AppLayout from "@/layouts/AppLayout";
import StatusesContent from "../modules/statuses/components/content/StatusesContent";

export default function DashboardPage() {
  return (
    <AppLayout>
      <StatusesContent />
    </AppLayout>
  );
}
