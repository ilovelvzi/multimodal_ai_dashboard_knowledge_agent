import { redirect } from "next/navigation";
import { getServerSession, type NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerEnv } from "@/server/config/env";
import { loginFormSchema } from "@/server/validation/schemas";

export type UserRole = "admin" | "member";
export type AppSession = Awaited<ReturnType<typeof getAppSession>>;

const env = getServerEnv();

const credentialUsers = env.authUsers.map((user) => ({
  id: user.id,
  email: user.email.toLowerCase(),
  name: user.name,
  password: user.password,
  role: user.role,
}));

export const authOptions: NextAuthOptions = {
  secret: env.authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginFormSchema.safeParse(credentials ?? {});
        if (!parsed.success) {
          return null;
        }

        const user = credentialUsers.find((item) => item.email === parsed.data.email.toLowerCase());
        if (!user || user.password !== parsed.data.password) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === "string" ? token.userId : "";
        session.user.role = token.role === "admin" ? "admin" : "member";
      }
      return session;
    },
  },
};

export const authHandler = NextAuth(authOptions);

export async function getAppSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getAppSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireSession();
  if (session.user.role !== role) {
    redirect("/dashboard");
  }
  return session;
}

export function canAccessFeature(role: UserRole, feature: string) {
  if (role === "admin") {
    return true;
  }

  return !["settings"].includes(feature);
}
