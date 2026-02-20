import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Lead } from "@/lib/models";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET || "dev_access_secret";

// Middleware-like function for auth
async function isAuthenticated(_req: NextRequest) {
  const headersList = await headers();
  const auth = headersList.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.split(" ")[1];
  try {
    jwt.verify(token, ACCESS_TOKEN_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();
  if (!(await isAuthenticated(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lead = await Lead.findById(id).exec();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();
  if (!(await isAuthenticated(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updates = await req.json();
  const lead = await Lead.findByIdAndUpdate(id, updates, { new: true }).exec();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(lead);
}

// TODO: fix delete authorization to check for admin role
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();
  if (!(await isAuthenticated(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await Lead.findByIdAndDelete(id).exec();
  return NextResponse.json({ message: "Deleted" });
}
