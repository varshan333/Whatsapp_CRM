const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Conversation } = require('../models');

const router = express.Router();

// List conversations
router.get('/', authenticate, async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;
  const q = { clientId: req.query.clientId || undefined };
  if (!q.clientId) delete q.clientId;
  const items = await Conversation.find(q).skip(skip).limit(limit).exec();
  res.json({ data: items, page, limit });
});

// Get
router.get('/:id', authenticate, async (req, res) => {
  const c = await Conversation.findById(req.params.id).exec();
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

// Update status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  const c = await Conversation.findByIdAndUpdate(req.params.id, { status }, { new: true }).exec();
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

// Assign agent
router.patch('/:id/assign', authenticate, authorize(['admin']), async (req, res) => {
  const { agentId } = req.body;
  const c = await Conversation.findByIdAndUpdate(req.params.id, { assignedAgentId: agentId }, { new: true }).exec();
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

module.exports = router;
