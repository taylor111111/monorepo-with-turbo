export async function fetchUser() {
  await new Promise((r) => setTimeout(r, 150));

  return {
    id: "user_001",
    name: "User demo",
    role: "admin"
  };
}
