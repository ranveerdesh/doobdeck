import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import { normalizeInviteCode } from "@/lib/invite-codes";
import { rateLimit } from "@/lib/rate-limit";

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const limit = rateLimit(`register:${ip}`, {
      limit: REGISTER_LIMIT,
      windowMs: REGISTER_WINDOW_MS,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      // Return a generic error to avoid confirming whether the email is registered
      return NextResponse.json(
        { error: "Registration failed. Please check your details and try again." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
