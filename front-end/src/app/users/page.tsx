import AppLayout from "@/layouts/AppLayout";
import UsersContent from "../modules/users/components/list/UsersContent";

export default function DashboardPage() {
  return (
    <AppLayout>
      <UsersContent />
    </AppLayout>
  );
}
