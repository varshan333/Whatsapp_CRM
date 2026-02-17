import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/lib/models";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET || "dev_access_secret";

export async function GET(_req: NextRequest) {
  await connectDB();
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload.sub).exec();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({
      id: user._id,
      fullName: user.name,
      email: user.email,
    });
  } catch (_e) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
