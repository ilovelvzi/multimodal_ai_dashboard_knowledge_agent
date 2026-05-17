import { AppShell } from "@/components/app-shell";
import { getDemoSession } from "@/server/auth/session";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell session={getDemoSession()}>{children}</AppShell>;
}
