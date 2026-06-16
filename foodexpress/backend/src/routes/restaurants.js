const express = require('express');
const { Op } = require('sequelize');
const { Restaurant, Category, FoodItem, Review, User } = require('../models');
const { auth } = require('../middleware/auth');
const { summarizeReviews } = require('../services/gemini');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, categoryId, minRating, maxPrice, isVeg, cuisineType, featured } = req.query;
    const where = { isOpen: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cuisineType: { [Op.like]: `%${search}%` } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (minRating) where.rating = { [Op.gte]: parseFloat(minRating) };
    if (maxPrice) where.priceForTwo = { [Op.lte]: parseFloat(maxPrice) };
    if (cuisineType) where.cuisineType = { [Op.like]: `%${cuisineType}%` };
    if (featured === 'true') where.featured = true;

    const restaurants = await Restaurant.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name', 'slug'] }],
      order: [['rating', 'DESC']]
    });

    let result = restaurants;
    if (isVeg === 'true') {
      const vegRestaurantIds = await FoodItem.findAll({
        where: { isVeg: true, available: true },
        attributes: ['restaurantId'],
        group: ['restaurantId']
      });
      const ids = vegRestaurantIds.map(f => f.restaurantId);
      result = restaurants.filter(r => ids.includes(r.id));
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: FoodItem, where: { available: true }, required: false },
        {
          model: Review,
          include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
          limit: 20,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const aiSummary = await summarizeReviews(restaurant.Reviews || [], restaurant.rating);
    res.json({ ...restaurant.toJSON(), aiSummary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/reviews', auth(), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const review = await Review.create({
      rating, comment, userId: req.user.id, restaurantId: req.params.id
    });

    const reviews = await Review.findAll({ where: { restaurantId: req.params.id } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Restaurant.update({ rating: Math.round(avg * 10) / 10 }, { where: { id: req.params.id } });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
