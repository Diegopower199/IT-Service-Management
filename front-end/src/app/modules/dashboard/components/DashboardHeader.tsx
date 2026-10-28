interface DashboardHeaderProps {
  username: string;
  role: string;
}

export default function DashboardHeader({
  username,
  role,
}: DashboardHeaderProps) {
  const getDescription = () => {
    switch (role) {
      case "ADMIN":
        return "System overview and help desk activity.";

      case "TECHNICIAN":
        return "Overview of your assigned tickets and current workload.";

      case "USER":
        return "Overview of your help desk activity.";

      default:
        return "Help desk overview.";
    }
  };

  return (
    <header>
      <h1>Welcome, {username}</h1>

      <p>{getDescription()}</p>
    </header>
  );
}
