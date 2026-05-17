import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#09090b_100%)] px-4 py-10">
      <div className="w-full max-w-3xl">
        <LoginForm />
      </div>
    </main>
  );
}
