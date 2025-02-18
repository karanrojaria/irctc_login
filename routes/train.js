const express = require('express');
const Train = require('../models/Train');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Add train (admin only)
router.post('/add', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { name, source, destination, total_seats } = req.body;
  const train = await Train.create({ name, source, destination, total_seats });
  res.status(201).json(train);
});

module.exports = router;
