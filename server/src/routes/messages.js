const express = require('express');
const { z } = require('zod');
const { authenticate, authorize } = require('../middleware/auth');
const { Message } = require('../models');
const { enqueueMessage } = require('../queue');
const { sendTemplateMessage } = require('../providers/whatsapp');

const router = express.Router();

const sendTemplateSchema = z.object({ to: z.string().min(4), templateName: z.string().min(1), language: z.string().optional(), components: z.array(z.any()).optional() });

// list messages
router.get('/', authenticate, async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;
  const q = { conversationId: req.query.conversationId || undefined };
  if (!q.conversationId) delete q.conversationId;
  const items = await Message.find(q).skip(skip).limit(limit).exec();
  res.json({ data: items, page, limit });
});

// send template (enqueue + attempt immediate send)
router.post('/template', authenticate, async (req, res) => {
  try {
    const parsed = sendTemplateSchema.parse(req.body);
    // create message record (status pending)
    const msg = await Message.create({ clientId: req.body.clientId || null, messageType: 'template', content: { template: parsed.templateName }, timestamp: Date.now(), status: 'sent' });
    // enqueue
    await enqueueMessage({ type: 'outbound', id: msg._id.toString(), to: parsed.to, templateName: parsed.templateName, language: parsed.language || 'en_US', components: parsed.components || [] });
    // try to send immediately (best-effort)
    try {
      await sendTemplateMessage(parsed.to, parsed.templateName, parsed.language || 'en_US', parsed.components || []);
    } catch (e) {
      console.warn('Immediate send failed, queued for retry', e.message);
    }
    res.status(202).json({ messageId: msg._id });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
