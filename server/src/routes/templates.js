const express = require('express');
const { z } = require('zod');
const { authenticate, authorize } = require('../middleware/auth');
const { Template } = require('../models');

const router = express.Router();

const schema = z.object({ name: z.string().min(1), language: z.string().min(2), content: z.string().min(1), variables: z.array(z.string()).optional() });

router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const parsed = schema.parse(req.body);
    const t = await Template.create({ ...parsed, clientId: req.body.clientId || null });
    res.status(201).json(t);
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
  const items = await Template.find({ clientId: req.query.clientId || undefined }).exec();
  res.json(items);
});

module.exports = router;
