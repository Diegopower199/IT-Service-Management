const demoAdministrator = "admin_demo";
const demoAccounts = new Set([demoAdministrator, "technician_demo", "user_demo"]);

export function isDemoAdministrator(username: string | undefined): boolean {
  return username?.toLowerCase() === demoAdministrator;
}

export function isDemoAccount(username: string): boolean {
  return demoAccounts.has(username.toLowerCase());
}

export function isUserEditRestricted(actorUsername: string | undefined, targetUsername: string): boolean {
  return isDemoAdministrator(actorUsername)
    && (targetUsername.toLowerCase() === "admin" || isDemoAccount(targetUsername));
}
