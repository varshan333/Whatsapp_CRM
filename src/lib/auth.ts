import jwt from "jsonwebtoken";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET || "dev_access_secret";

export interface AuthPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export async function verifyAccessToken(
  _req: NextRequest,
): Promise<{ ok: boolean; status: number; payload?: AuthPayload }> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401 };
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthPayload;
    return { ok: true, status: 200, payload };
  } catch {
    return { ok: false, status: 401 };
  }
}
