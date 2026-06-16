const express = require('express');
const { Cart, FoodItem, Restaurant } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
}

router.get('/', auth(), async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/add', auth(), async (req, res) => {
  try {
    const { foodItemId, quantity = 1 } = req.body;
    const food = await FoodItem.findByPk(foodItemId, { include: [Restaurant] });
    if (!food || !food.available) return res.status(404).json({ message: 'Food item not found' });

    const cart = await getOrCreateCart(req.user.id);
    const items = [...(cart.items || [])];
    const existing = items.find(i => i.foodItemId === foodItemId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      if (items.length > 0 && items[0].restaurantId !== food.restaurantId) {
        return res.status(400).json({ message: 'Cart can only contain items from one restaurant' });
      }
      items.push({
        foodItemId: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity,
        restaurantId: food.restaurantId,
        restaurantName: food.Restaurant?.name
      });
    }

    cart.items = items;
    cart.changed('items', true);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/update', auth(), async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const items = [...(cart.items || [])];
    const idx = items.findIndex(i => i.foodItemId === foodItemId);
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) items.splice(idx, 1);
    else items[idx].quantity = quantity;

    cart.items = items;
    cart.changed('items', true);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/remove/:foodItemId', auth(), async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = (cart.items || []).filter(i => i.foodItemId !== parseInt(req.params.foodItemId));
    cart.changed('items', true);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/clear', auth(), async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    cart.changed('items', true);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
