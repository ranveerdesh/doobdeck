import type { NextAuthConfig } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import type { Session } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: {
      auth: Session | null;
      request: { nextUrl: URL };
    }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/auth");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isPublicPage = nextUrl.pathname === "/";

      if (isAuthPage || isApiAuth || isPublicPage) {
        if (isLoggedIn && isAuthPage) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        const callbackUrl = nextUrl.pathname + nextUrl.search;
        const encodedCallback = encodeURIComponent(callbackUrl);
        return Response.redirect(
          new URL(`/auth/sign-in?callbackUrl=${encodedCallback}`, nextUrl)
        );
      }

      return true;
    },
    jwt({ token, user }: { token: JWT; user?: { id?: string } }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" as const },
} satisfies NextAuthConfig;


