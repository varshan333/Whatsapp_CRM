import crypto from "node:crypto";

// Minimal nanoid-like generator
export function nanoid(size = 12) {
  // base64url gives safe chars, then trim to requested size
  return crypto
    .randomBytes(Math.ceil((size * 3) / 4))
    .toString("base64url")
    .slice(0, size);
}
