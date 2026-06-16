const express = require('express');
const { FoodItem, Restaurant, Order, OrderItem } = require('../models');
const { auth } = require('../middleware/auth');
const {
  foodAssistant,
  mealRecommendation,
  customerSupport,
  parseVoiceOrder,
  analyzeNutrition
} = require('../services/gemini');

const router = express.Router();

router.post('/assistant', auth(), async (req, res) => {
  try {
    const items = await FoodItem.findAll({
      where: { available: true },
      include: [{ model: Restaurant, attributes: ['id', 'name'] }],
      limit: 100
    });
    const result = await foodAssistant(req.body.query, items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/recommendations', auth(), async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [FoodItem] }],
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    const items = await FoodItem.findAll({
      where: { available: true },
      include: [{ model: Restaurant, attributes: ['id', 'name'] }],
      limit: 100
    });

    const context = {
      hour: new Date().getHours(),
      previousOrders: orders.map(o => o.OrderItems?.map(oi => oi.FoodItem?.name)).flat().filter(Boolean),
      budget: req.query.budget ? parseFloat(req.query.budget) : null
    };

    const result = await mealRecommendation(context, items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/support', auth(), async (req, res) => {
  try {
    let orderContext = null;
    if (req.body.orderId) {
      orderContext = await Order.findOne({
        where: { id: req.body.orderId, userId: req.user.id },
        include: [{ model: Restaurant, attributes: ['name'] }]
      });
    }
    const result = await customerSupport(req.body.query, orderContext);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/voice-order', auth(), async (req, res) => {
  try {
    const items = await FoodItem.findAll({ where: { available: true }, limit: 100 });
    const result = await parseVoiceOrder(req.body.transcript, items);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/nutrition/:foodId', async (req, res) => {
  try {
    const food = await FoodItem.findByPk(req.params.foodId);
    if (!food) return res.status(404).json({ message: 'Food item not found' });

    if (food.calories) {
      return res.json({
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        healthScore: food.healthScore
      });
    }

    const nutrition = await analyzeNutrition(food.name, food.description);
    await food.update(nutrition);
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
