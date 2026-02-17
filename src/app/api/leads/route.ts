import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

const createSchema = z.object({
  phoneNumber: z.string().min(4),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  clientId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  await connectDB();
  if (!(await isAuthenticated(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const lead = await Lead.create({
      ...parsed,
      clientId: parsed.clientId || null,
    });
    return NextResponse.json(lead, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError")
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  if (!(await isAuthenticated(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "20", 10),
    100,
  );
  const skip = (page - 1) * limit;
  const clientId = url.searchParams.get("clientId");

  const q: any = {};
  if (clientId) q.clientId = clientId;

  const leads = await Lead.find(q).skip(skip).limit(limit).exec();
  return NextResponse.json({ data: leads, page, limit });
}
