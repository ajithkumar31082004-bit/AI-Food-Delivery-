const express = require('express');
const { Restaurant, FoodItem, Order, OrderItem, Review, Payment, User } = require('../models');
const { auth } = require('../middleware/auth');
const { generateRestaurantDescription, orderForecast, analyzeNutrition } = require('../services/gemini');

const router = express.Router();
router.use(auth(['owner', 'admin']));

async function getOwnerRestaurant(userId, restaurantId) {
  const where = { ownerId: userId };
  if (restaurantId) where.id = restaurantId;
  return Restaurant.findOne({ where });
}

router.get('/stats', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id, req.query.restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const orders = await Order.findAll({
      where: { restaurantId: restaurant.id },
      include: [{ model: OrderItem, include: [FoodItem] }, { model: Payment }]
    });

    const revenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((s, o) => s + o.total, 0);

    const foodCounts = {};
    orders.forEach(o => {
      o.OrderItems?.forEach(oi => {
        const name = oi.FoodItem?.name || 'Unknown';
        foodCounts[name] = (foodCounts[name] || 0) + oi.quantity;
      });
    });

    const popularFoods = Object.entries(foodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const reviews = await Review.findAll({ where: { restaurantId: restaurant.id } });
    const avgRating = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : restaurant.rating;

    const orderHistory = orders.slice(0, 50).map(o => ({
      status: o.status,
      total: o.total,
      createdAt: o.createdAt
    }));
    const forecast = await orderForecast(orderHistory);

    res.json({
      restaurant,
      totalOrders: orders.length,
      revenue: Math.round(revenue),
      popularFoods,
      avgRating: Math.round(avgRating * 10) / 10,
      recentOrders: orders.slice(0, 10),
      forecast
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/restaurant', async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/restaurant', async (req, res) => {
  try {
    let restaurant = await Restaurant.findOne({ where: { ownerId: req.user.id } });
    if (!restaurant) {
      restaurant = await Restaurant.create({ ...req.body, ownerId: req.user.id });
    } else {
      await restaurant.update(req.body);
    }
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/generate-description', async (req, res) => {
  try {
    const { name, cuisineType } = req.body;
    const result = await generateRestaurantDescription(name, cuisineType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/menu', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    const items = await FoodItem.findAll({ where: { restaurantId: restaurant.id } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/menu', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    let nutrition = {};
    if (!req.body.calories) {
      nutrition = await analyzeNutrition(req.body.name, req.body.description);
    }

    const item = await FoodItem.create({
      ...req.body,
      ...nutrition,
      restaurantId: restaurant.id
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/menu/:id', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    const item = await FoodItem.findOne({ where: { id: req.params.id, restaurantId: restaurant?.id } });
    if (!item) return res.status(404).json({ message: 'Food item not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/menu/:id', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    await FoodItem.destroy({ where: { id: req.params.id, restaurantId: restaurant?.id } });
    res.json({ message: 'Food item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const orders = await Order.findAll({
      where: { restaurantId: restaurant.id },
      include: [
        { model: OrderItem, include: [FoodItem] },
        { model: User, attributes: ['id', 'name', 'phone'] },
        { model: Payment }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user.id);
    const order = await Order.findOne({ where: { id: req.params.id, restaurantId: restaurant?.id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status;
    await order.save();

    const io = req.app.get('io');
    if (io) io.to(`order-${order.id}`).emit('orderUpdate', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
