import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { RefreshToken, User } from "@/lib/models";
import { nanoid } from "@/utils/id";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET || "dev_access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_TOKEN_SECRET || "dev_refresh_secret";
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRY || "900s";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  agreeToTerms: z.boolean(),
});

function signAccessToken(user: any) {
  return jwt.sign({ sub: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(tokenId: string, userId: string) {
  return jwt.sign({ tid: tokenId, sub: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json();
    const parsed = signupSchema.parse(body);

    const exists = await User.findOne({ email: parsed.email }).exec();
    if (exists)
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await User.create({
      name: parsed.fullName,
      email: parsed.email,
      passwordHash,
    });

    const accessToken = signAccessToken(user);
    const refreshId = `r_${nanoid(12)}`;
    const refreshToken = signRefreshToken(refreshId, user._id.toString());
    await RefreshToken.create({ tokenId: refreshId, userId: user._id });

    // Cookie setting
    const cookieStore = await cookies();
    cookieStore.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json(
      {
        user: { id: user._id, fullName: user.name, email: user.email },
        accessToken,
      },
      { status: 201 },
    );
  } catch (err: any) {
    if (err.name === "ZodError")
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
