const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

const createSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(8), role: z.enum(['admin','agent']).optional() });

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const user = await User.create({ name: parsed.name, email: parsed.email, passwordHash, role: parsed.role || 'agent' });
    res.status(201).json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  const items = await User.find({}).select('-passwordHash').exec();
  res.json(items);
});

module.exports = router;
