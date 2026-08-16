import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { signInSchema } from "@/lib/validations";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

const SIGNIN_LIMIT = 5;
const SIGNIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const key = `signin:${email.toLowerCase()}`;

        const limit = rateLimit(key, { limit: SIGNIN_LIMIT, windowMs: SIGNIN_WINDOW_MS });
        if (!limit.allowed) {
          console.warn(`[auth] Sign-in rate limit exceeded for: ${email}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
          },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        resetRateLimit(key);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
