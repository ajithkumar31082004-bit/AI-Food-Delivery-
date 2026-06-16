const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Cart } = require('../models');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate({
  name: { required: true, minLength: 2 },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  password: { required: true, minLength: 6 },
  confirmPassword: { required: true, match: 'password' }
}), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const allowedRole = ['customer', 'owner'].includes(role) ? role : 'customer';
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed, role: allowedRole });
    await Cart.create({ userId: user.id, items: [] });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', validate({
  email: { required: true, email: true },
  password: { required: true, minLength: 1 }
}), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/logout', auth(), (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', auth(), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
