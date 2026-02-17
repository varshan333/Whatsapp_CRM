import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { RefreshToken } from "@/lib/models";

const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_TOKEN_SECRET || "dev_refresh_secret";

export async function POST(_req: NextRequest) {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get("refreshToken")?.value;

  if (token) {
    try {
      const payload: any = jwt.verify(token, REFRESH_TOKEN_SECRET);
      const tid = payload.tid;
      await RefreshToken.findOneAndUpdate(
        { tokenId: tid },
        { revoked: true },
      ).exec();
    } catch (_e) {
      // ignore
    }
  }

  // Clear cookie
  cookieStore.delete("refreshToken");

  return NextResponse.json({ message: "Logged out" });
}
