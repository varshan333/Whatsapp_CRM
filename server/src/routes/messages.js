const express = require('express');
const { z } = require('zod');
const { authenticate, authorize } = require('../middleware/auth');
const { Message, Conversation } = require('../models');
const { enqueueMessage } = require('../queue');
const providers = require('../providers');

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

    // basic fields and validation
    const tenantId = req.body.tenantId || null;
    const provider = req.body.provider || 'whatsapp';
    const toNumber = parsed.to;
    const templateName = parsed.templateName;
    const language = parsed.language || 'en_US';
    const components = parsed.components || [];

    // ensure conversation exists or create a placeholder conversation (simplified)
    let conversation = null;
    if (req.body.conversationId) {
      conversation = await Conversation.findById(req.body.conversationId).exec();
    }

    const message = new Message({
      conversationId: conversation ? conversation._id : null,
      clientId: tenantId,
      senderType: 'agent',
      messageType: 'template',
      to: toNumber,
      template: { name: templateName, language, components },
      templateName,
      status: 'queued',
      content: { text: req.body.text || '' },
    });
    await message.save();

    const job = {
      type: 'outbound',
      subtype: 'template',
      messageId: message._id.toString(),
      tenantId,
      provider,
      payload: {
        to: toNumber,
        template: { name: templateName, language, components },
        text: req.body.text || '',
      },
      attempts: 0,
      maxAttempts: 3,
    };

    await enqueueMessage(job);

    // best-effort immediate send (non-blocking)
    try {
      providers[provider]?.sendTemplateMessage?.(job.payload.to, templateName, language, components).catch(() => {});
    } catch (e) {
      // ignore - worker will retry
    }

    res.status(201).json({ message });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
