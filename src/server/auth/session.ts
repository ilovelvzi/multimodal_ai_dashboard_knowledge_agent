export type UserRole = "admin" | "member";

export type DemoSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

const demoSession: DemoSession = {
  user: {
    id: "demo-admin",
    name: "Demo Admin",
    email: "admin@example.com",
    role: "admin",
  },
};

export function getDemoSession(): DemoSession {
  return demoSession;
}

export function canAccessFeature(role: UserRole, feature: string) {
  if (role === "admin") {
    return true;
  }

  return !["settings"].includes(feature);
}
