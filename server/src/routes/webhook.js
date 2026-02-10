const express = require('express');
const { verifySignature } = require('../providers/whatsapp');
const { enqueueMessage } = require('../queue');

const router = express.Router();

// Health / challenge for provider verification
router.get('/', (req, res) => res.send('ok'));

// POST webhook
router.post('/incoming', async (req, res) => {
  try {
    // provider signature verification (placeholder)
    if (!verifySignature(req)) return res.status(403).json({ error: 'Invalid signature' });

    const payload = req.body;
    // enqueue for async processing (conversation creation, lead creation)
    await enqueueMessage({ type: 'incoming', payload });

    // acknowledge immediately
    res.sendStatus(200);
  } catch (err) {
    console.error('webhook error', err);
    res.sendStatus(500);
  }
});

module.exports = router;
