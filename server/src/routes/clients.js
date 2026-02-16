const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { Client } = require('../models');

const router = express.Router();

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const c = await Client.create(req.body);
  res.status(201).json(c);
});

router.get('/', authenticate, async (req, res) => {
  const items = await Client.find({}).exec();
  res.json(items);
});

module.exports = router;
