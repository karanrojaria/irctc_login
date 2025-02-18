const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Train, Booking } = require('./models');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// User Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(400).json({ error: 'User registration failed' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Admin Add Train (Protected by API key)
app.post('/admin/add-train', adminMiddleware, async (req, res) => {
  const { name, source, destination, total_seats } = req.body;

  try {
    const train = await Train.create({ name, source, destination, total_seats });
    res.status(201).json({ message: 'Train added successfully', train });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add train' });
  }
});

// Get Seat Availability
app.get('/trains/availability', async (req, res) => {
  const { source, destination } = req.query;

  const trains = await Train.findAll({
    where: { source, destination },
  });

  if (trains.length === 0) {
    return res.status(404).json({ error: 'No trains found for the given route' });
  }

  res.json({ trains });
});

// Book a Seat
app.post('/bookings/book', authMiddleware, async (req, res) => {
  const { train_id, seats_to_book } = req.body;
  const user_id = req.user.id;

  const transaction = await sequelize.transaction();
  try {
    const train = await Train.findOne({ where: { id: train_id } });
    if (train.total_seats < seats_to_book) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    train.total_seats -= seats_to_book;
    await train.save({ transaction });

    const booking = await Booking.create({ user_id, train_id, seats_booked: seats_to_book }, { transaction });
    await transaction.commit();

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Get Specific Booking Details
app.get('/bookings/details/:booking_id', authMiddleware, async (req, res) => {
  const { booking_id } = req.params;

  const booking = await Booking.findOne({
    where: { id: booking_id, user_id: req.user.id },
  });

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({ booking });
});

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
