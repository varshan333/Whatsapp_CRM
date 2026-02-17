import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import { sendResetEmail } from "@/lib/email";
import { User } from "@/lib/models";
import { nanoid } from "@/utils/id";

export async function POST(req: NextRequest) {
  await connectDB();
  const schema = z.object({ email: z.string().email() });
  try {
    const body = await req.json();
    const { email } = schema.parse(body);
    const user = await User.findOne({ email }).exec();

    if (user) {
      const token = nanoid(24);
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
      await user.save();
      sendResetEmail(user.email, token);
    }

    return NextResponse.json({
      message: "If this email is registered, a reset link was sent",
    });
  } catch (_err) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
}
