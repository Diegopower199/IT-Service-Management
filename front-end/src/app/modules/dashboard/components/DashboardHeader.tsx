interface DashboardHeaderProps {
  username: string;
  rol: string;
}

export default function DashboardHeader({
  username,
  rol,
}: DashboardHeaderProps) {
  const getDescription = () => {
    switch (rol) {
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
