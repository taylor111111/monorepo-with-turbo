export function canAccessUserDashboard(user) {
  return user.role === "admin";
}
