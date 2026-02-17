import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { RefreshToken, User } from "@/lib/models";

export async function POST(req: NextRequest) {
  await connectDB();
  const schema = z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  });

  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }).exec();
    if (!user)
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    await RefreshToken.updateMany(
      { userId: user._id },
      { revoked: true },
    ).exec();

    return NextResponse.json({ message: "Password updated" });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
