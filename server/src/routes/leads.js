const express = require('express');
const { z } = require('zod');
const { authenticate, authorize } = require('../middleware/auth');
const { Lead } = require('../models');

const router = express.Router();

const createSchema = z.object({ phoneNumber: z.string().min(4), name: z.string().optional(), tags: z.array(z.string()).optional() });

// Create lead
router.post('/', authenticate, async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const lead = await Lead.create({ ...parsed, clientId: req.body.clientId || null });
    res.status(201).json(lead);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List leads with simple pagination
router.get('/', authenticate, async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const skip = (page - 1) * limit;
  const q = { clientId: req.query.clientId || undefined };
  if (!q.clientId) delete q.clientId;
  const leads = await Lead.find(q).skip(skip).limit(limit).exec();
  res.json({ data: leads, page, limit });
});

// Get lead
router.get('/:id', authenticate, async (req, res) => {
  const lead = await Lead.findById(req.params.id).exec();
  if (!lead) return res.status(404).json({ error: 'Not found' });
  res.json(lead);
});

// Update
router.put('/:id', authenticate, async (req, res) => {
  const updates = req.body;
  const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true }).exec();
  if (!lead) return res.status(404).json({ error: 'Not found' });
  res.json(lead);
});

// Delete
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id).exec();
  res.json({ message: 'Deleted' });
});

module.exports = router;
