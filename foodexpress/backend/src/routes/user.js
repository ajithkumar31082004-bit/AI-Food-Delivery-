const express = require('express');
const bcrypt = require('bcryptjs');
const { Address, Favorite, Order, OrderItem, FoodItem, Restaurant, User, Coupon } = require('../models');
const { auth } = require('../middleware/auth');
const { generateCoupon } = require('../services/gemini');

const router = express.Router();
router.use(auth());

router.get('/profile', (req, res) => {
  res.json(req.user);
});

router.put('/profile', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { name, phone, avatar } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/addresses', async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/addresses', async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }
    const address = await Address.create({ ...req.body, userId: req.user.id });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.user.id } });
    }
    await address.update(req.body);
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    await Address.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [Restaurant]
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/favorites/:restaurantId', async (req, res) => {
  try {
    const [favorite] = await Favorite.findOrCreate({
      where: { userId: req.user.id, restaurantId: req.params.restaurantId }
    });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/favorites/:restaurantId', async (req, res) => {
  try {
    await Favorite.destroy({ where: { userId: req.user.id, restaurantId: req.params.restaurantId } });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/coupons/generate', async (req, res) => {
  try {
    const orderCount = await Order.count({ where: { userId: req.user.id } });
    const stats = { orderCount, userId: req.user.id };
    const couponData = await generateCoupon(stats);

    const coupon = await Coupon.create({
      code: couponData.code,
      discountType: couponData.discountType || 'percentage',
      discountValue: couponData.discountValue || 10,
      minOrder: 199,
      maxDiscount: 100,
      userId: req.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({ ...coupon.toJSON(), message: couponData.message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: { userId: req.user.id, isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
