import { AuthOptions, DefaultSession, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { resolveTimeZone } from "@/lib/date";
import { createGuest, GUEST_BUSY } from "@/lib/guest";
import { allowGuestCreation, hasRedis } from "@/lib/ratelimit";

export const guestDemoEnabled =
  process.env.GUEST_DEMO === "1" &&
  (process.env.NODE_ENV !== "production" || hasRedis);

declare module "next-auth/jwt" {
  interface JWT {
    guestExpiresAt?: number;
  }
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      guestExpiresAt?: number;
    } & DefaultSession["user"];
  }
  interface User {
    guestExpiresAt?: Date | null;
  }
}

// Local-only login for testing against the docker DB. Never active in
// production builds (NODE_ENV) and needs DEV_LOGIN=1 in .env.local.
const devLoginEnabled =
  process.env.NODE_ENV === "development" && process.env.DEV_LOGIN === "1";

const adapter = PrismaAdapter(prisma);

export const authOptions: AuthOptions = {
  adapter: {
    ...adapter,
    // NextAuth uses getUser to decide whether OAuth should link to an existing
    // session. A temporary guest must always start a separate Google account.
    async getUser(id) {
      const user = await adapter.getUser!(id);
      return user && "isGuest" in user && user.isGuest ? null : user;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    ...(guestDemoEnabled
      ? [
          CredentialsProvider({
            id: "guest",
            name: "Guest demo",
            credentials: { timeZone: { type: "text" } },
            async authorize(credentials, request) {
              // Vercel supplies this header. On other hosts, share one bucket.
              const ip = process.env.VERCEL === "1"
                ? request.headers?.["x-vercel-forwarded-for"]
                : undefined;
              const client = typeof ip === "string" ? ip.split(",")[0].trim() : "";
              try {
                if (!await allowGuestCreation(client || "unknown")) throw new Error(GUEST_BUSY);
                return await createGuest(resolveTimeZone(credentials?.timeZone));
              } catch (error) {
                if (!(error instanceof Error) || error.message !== GUEST_BUSY) {
                  console.error("Guest demo setup failed", error);
                }
                throw new Error(GUEST_BUSY);
              }
            },
          }),
        ]
      : []),
    ...(devLoginEnabled
      ? [
          CredentialsProvider({
            id: "dev-login",
            name: "Dev login",
            credentials: { email: { label: "Email", type: "text" } },
            async authorize(credentials) {
              if (!credentials?.email) return null;
              return prisma.user.findUnique({
                where: { email: credentials.email },
              });
            },
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.guestExpiresAt = user.guestExpiresAt?.getTime();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.guestExpiresAt = token.guestExpiresAt;
        if (token.guestExpiresAt !== undefined) {
          session.expires = new Date(token.guestExpiresAt).toISOString();
          if (token.guestExpiresAt <= Date.now()) session.user.id = "";
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

export const getAppSession = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if (session.user.guestExpiresAt !== undefined) {
    const guest = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        isGuest: true,
        guestExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (!guest) return null;
  }
  return session;
});
