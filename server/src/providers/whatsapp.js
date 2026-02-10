/**
 * Minimal WhatsApp provider scaffold. Replace HTTP client code with actual
 * provider integration (Meta Cloud API / Twilio) in production.
 */
const fetch = require('node-fetch');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';

async function sendTemplateMessage(to, templateName, language = 'en_US', components = []) {
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TOKEN) throw new Error('WhatsApp provider not configured');
  const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      components,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error('WhatsApp API error: ' + text);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// For incoming webhook verification/validation, keep a placeholder
function verifySignature(req) {
  // TODO: implement HMAC signature verification per provider
  return true;
}

module.exports = { sendTemplateMessage, verifySignature };
