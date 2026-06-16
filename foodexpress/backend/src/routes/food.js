const express = require('express');
const { Op } = require('sequelize');
const { FoodItem, Restaurant } = require('../models');
const { smartSearch } = require('../services/gemini');

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });

    const filters = await smartSearch(q);
    const foodWhere = { available: true };
    const restaurantWhere = { isOpen: true };

    if (filters.search) {
      foodWhere[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    if (filters.maxPrice) foodWhere.price = { [Op.lte]: filters.maxPrice };
    if (filters.isVeg === true) foodWhere.isVeg = true;
    if (filters.cuisineType) restaurantWhere.cuisineType = { [Op.like]: `%${filters.cuisineType}%` };
    if (filters.minRating) restaurantWhere.rating = { [Op.gte]: filters.minRating };

    const items = await FoodItem.findAll({
      where: foodWhere,
      include: [{ model: Restaurant, where: restaurantWhere }],
      order: [[Restaurant, 'rating', 'DESC']]
    });

    res.json({ filters, results: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/menu/:restaurantId', async (req, res) => {
  try {
    const items = await FoodItem.findAll({
      where: { restaurantId: req.params.restaurantId, available: true },
      order: [['menuCategory', 'ASC'], ['name', 'ASC']]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
