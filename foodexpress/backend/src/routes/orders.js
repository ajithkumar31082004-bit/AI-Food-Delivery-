const express = require('express');
const { Order, OrderItem, Cart, Payment, FoodItem, Restaurant, Coupon } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();
const GST_RATE = 0.05;
const DELIVERY_CHARGE = 40;

const PARTNERS = ['Rajesh Kumar', 'Suresh Patel', 'Amit Singh', 'Vikram Reddy'];

router.post('/place', auth(), async (req, res) => {
  try {
    const { deliveryAddress, contactPhone, paymentMethod, couponCode } = req.body;
    if (!deliveryAddress || !contactPhone || !paymentMethod) {
      return res.status(400).json({ message: 'Delivery address, contact phone, and payment method required' });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart?.items?.length) return res.status(400).json({ message: 'Cart is empty' });

    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true } });
      if (coupon && subtotal >= coupon.minOrder) {
        discount = coupon.discountType === 'percentage'
          ? subtotal * (coupon.discountValue / 100)
          : coupon.discountValue;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    const tax = (subtotal - discount) * GST_RATE;
    const total = subtotal - discount + tax + DELIVERY_CHARGE;

    const order = await Order.create({
      userId: req.user.id,
      restaurantId: cart.items[0].restaurantId,
      subtotal,
      tax: Math.round(tax * 100) / 100,
      deliveryCharge: DELIVERY_CHARGE,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
      deliveryAddress,
      contactPhone,
      couponCode,
      deliveryTimeEstimate: 35,
      deliveryPartner: PARTNERS[Math.floor(Math.random() * PARTNERS.length)],
      status: 'placed'
    });

    for (const item of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: item.price
      });
    }

    await Payment.create({
      orderId: order.id,
      method: paymentMethod,
      amount: order.total,
      status: paymentMethod === 'cod' ? 'pending' : 'paid'
    });

    cart.items = [];
    cart.changed('items', true);
    await cart.save();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, include: [FoodItem] },
        { model: Restaurant },
        { model: Payment }
      ]
    });

    const io = req.app.get('io');
    if (io) io.to(`order-${order.id}`).emit('orderUpdate', fullOrder);

    res.status(201).json(fullOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', auth(), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: OrderItem, include: [FoodItem] },
        { model: Restaurant, attributes: ['id', 'name', 'image'] },
        { model: Payment }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/track/:id', auth(), async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: OrderItem, include: [FoodItem] },
        { model: Restaurant },
        { model: Payment }
      ]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/cancel/:id', auth(), async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['placed', 'preparing'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
