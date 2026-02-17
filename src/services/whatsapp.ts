import fetch from "node-fetch";

/**
 * Minimal WhatsApp provider scaffold. Replace HTTP client code with actual
 * provider integration (Meta Cloud API / Twilio) in production.
 */

const WHATSAPP_API_URL =
  process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0";
// These environment variables should be available in Next.js backend
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  language = "en_US",
  components: any[] = [],
) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    // In dev, maybe we just log it if not configured
    console.warn(
      "WhatsApp provider not configured (WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_TOKEN missing)",
    );
    if (process.env.NODE_ENV === "development") return { status: "mock_sent" };
    throw new Error("WhatsApp provider not configured");
  }

  const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      components,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const err: any = new Error(`WhatsApp API error: ${text}`);
    err.status = res.status;
    throw err;
  }

  return await res.json();
}

// For incoming webhook verification/validation, keep a placeholder
export function verifySignature(_req: Request) {
  // TODO: implement HMAC signature verification per provider
  // e.g., inspect headers 'x-hub-signature-256'
  return true;
}
