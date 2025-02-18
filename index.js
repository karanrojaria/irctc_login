const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware for JWT Authentication
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

// User Registration
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, role]
    );
    res.status(201).json({ message: 'User Registered', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available trains
app.get('/trains', authenticateToken, async (req, res) => {
  try {
    const trains = await pool.query('SELECT * FROM trains');
    res.json(trains.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book a seat
app.post('/book', authenticateToken, async (req, res) => {
  const { train_id } = req.body;
  try {
    await pool.query('BEGIN');
    const seats = await pool.query('SELECT available_seats FROM trains WHERE id = $1 FOR UPDATE', [train_id]);
    if (seats.rows[0].available_seats <= 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ message: 'No seats available' });
    }
    await pool.query('UPDATE trains SET available_seats = available_seats - 1 WHERE id = $1', [train_id]);
    await pool.query('INSERT INTO bookings (user_id, train_id) VALUES ($1, $2)', [req.user.id, train_id]);
    await pool.query('COMMIT');
    res.json({ message: 'Booking successful' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
