import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "IIITDM Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "yourname@iiitdm.ac.in" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Login failed");
          }

          return {
            id: data.user._id,
            email: data.user.email,
            name: data.user.fullName,
            role: data.user.role,
            messId: data.user.messId,
            rollNumber: data.user.rollNumber,
            token: data.token,
          };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Login failed";
          throw new Error(message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
        token.messId = user.messId;
        token.rollNumber = user.rollNumber;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).userId = token.userId;
        (session.user as Record<string, unknown>).messId = token.messId;
        (session.user as Record<string, unknown>).rollNumber = token.rollNumber;
        (session.user as Record<string, unknown>).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
