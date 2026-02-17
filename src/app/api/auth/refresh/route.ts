import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { RefreshToken, User } from "@/lib/models";
import { nanoid } from "@/utils/id";

const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_TOKEN_SECRET || "dev_refresh_secret";
const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET || "dev_access_secret";
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRY || "900s";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRY || "7d";

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

export async function POST(_req: NextRequest) {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (!token)
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  try {
    const payload: any = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const tid = payload.tid;

    const stored = await RefreshToken.findOne({
      tokenId: tid,
      revoked: false,
    }).exec();
    if (!stored)
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );

    // rotate
    stored.revoked = true;
    await stored.save();

    const newTid = `r_${nanoid(12)}`;
    const newRefresh = signRefreshToken(newTid, payload.sub);
    await RefreshToken.create({ tokenId: newTid, userId: payload.sub });

    cookieStore.set({
      name: "refreshToken",
      value: newRefresh,
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    const user = await User.findById(payload.sub).exec();
    if (!user)
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });

    const accessToken = signAccessToken(user);

    return NextResponse.json({
      accessToken,
      user: { id: user._id, fullName: user.name, email: user.email },
    });
  } catch (_e) {
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 },
    );
  }
}
