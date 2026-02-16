const express = require('express');
const { verifySignature } = require('../providers/whatsapp');
const { enqueueMessage } = require('../queue');
const { Message } = require('../models');

const router = express.Router();

// Health / challenge for provider verification
router.get('/', (req, res) => res.send('ok'));

// POST webhook - handles incoming messages and provider status receipts
router.post('/incoming', async (req, res) => {
  try {
    // provider signature verification (placeholder)
    if (!verifySignature(req)) return res.status(403).json({ error: 'Invalid signature' });

    const payload = req.body;

    // map various provider status strings to our internal enum
    const mapStatus = (s) => {
      if (!s) return 'unknown';
      const st = String(s).toLowerCase();
      if (['delivered', 'deliv', 'delivered_to_customer', 'delivered_to_device'].includes(st)) return 'delivered';
      if (['read', 'read_message', 'read_receipt'].includes(st)) return 'read';
      if (['failed', 'undelivered', 'error', 'failed_to_deliver', 'failed_delivery'].includes(st)) return 'failed';
      if (['sent', 'queued', 'accepted', 'sent_to_provider'].includes(st)) return 'sent';
      return 'unknown';
    };

    // Try Meta-like payload: entry[].changes[].value.statuses[]
    let statuses = [];
    if (payload && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (!entry.changes) continue;
        for (const change of entry.changes) {
          const v = change.value;
          if (v && Array.isArray(v.statuses)) {
            statuses.push(...v.statuses);
          }
          // some providers include messages array with status info
          if (v && Array.isArray(v.messages)) {
            statuses.push(...(v.messages.filter(m => m.status).map(m => ({ id: m.id || m.message_id, status: m.status, timestamp: m.timestamp, ...m }))));
          }
        }
      }
    }

    // Fallback shapes: top-level statuses or single status object
    if (!statuses.length) {
      if (Array.isArray(payload.statuses)) statuses = payload.statuses;
      else if (payload && payload.status) statuses = [payload];
      else if (payload && payload.statuses && payload.statuses.length) statuses = payload.statuses;
    }

    if (statuses.length) {
      // Process receipts asynchronously (fire-and-forget) so provider gets quick ack
      (async () => {
        try {
          for (const s of statuses) {
            const providerId = s.id || s.message_id || s.messageId || (s.message && (s.message.id || s.message.message_id));
            if (!providerId) {
              console.warn('webhook: status event with no message id', s);
              continue;
            }
            const mapped = mapStatus(s.status || s.status_name || s.statuses || s.state);
            const ts = s.timestamp ? (typeof s.timestamp === 'number' ? new Date(Number(s.timestamp) * 1000) : new Date(s.timestamp)) : new Date();

            const msg = await Message.findOne({ providerMessageId: providerId });
            if (!msg) {
              console.warn('webhook: no local message for provider id', providerId);
              continue;
            }

            const last = (msg.statusHistory && msg.statusHistory.length) ? msg.statusHistory[msg.statusHistory.length - 1] : null;
            if (last && last.status === mapped && last.timestamp && Math.abs(new Date(last.timestamp).getTime() - ts.getTime()) < 1000) {
              // duplicate or same timestamped update - skip
              continue;
            }

            msg.status = mapped;
            msg.statusHistory = msg.statusHistory || [];
            msg.statusHistory.push({ status: mapped, timestamp: ts, raw: s });
            await msg.save();
            console.log('webhook: updated message', msg._id.toString(), 'status ->', mapped);
          }
        } catch (err) {
          console.error('webhook status processing error', err);
        }
      })();
    } else {
      // Non-status incoming message - enqueue for async processing (conversation creation, lead creation)
      await enqueueMessage({ type: 'incoming', payload });
    }

    // acknowledge immediately
    res.sendStatus(200);
  } catch (err) {
    console.error('webhook error', err);
    res.sendStatus(500);
  }
});

module.exports = router;
