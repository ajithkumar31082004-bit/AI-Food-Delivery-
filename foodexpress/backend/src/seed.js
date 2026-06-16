require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Category, Restaurant, FoodItem, Coupon, Review } = require('./models');

const FOOD_IMAGES = {
  biryani: 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=400',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  dosa: 'https://images.unsplash.com/photo-1630387340960-179009d12635?w=400',
  curry: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
};

const REST_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600',
  'https://images.unsplash.com/photo-1424847651672-bf20cbf94543?w=600',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
  'https://images.unsplash.com/photo-1590846409422-0d3702bdb203?w=600'
];

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database synced');

  const adminPass = await bcrypt.hash('admin123', 10);
  const ownerPass = await bcrypt.hash('owner123', 10);
  const userPass = await bcrypt.hash('user1234', 10);

  const admin = await User.create({ name: 'Admin User', email: 'admin@foodexpress.com', phone: '9876543210', password: adminPass, role: 'admin' });
  const owner1 = await User.create({ name: 'Raj Owner', email: 'owner@foodexpress.com', phone: '9876543211', password: ownerPass, role: 'owner' });
  const owner2 = await User.create({ name: 'Priya Owner', email: 'owner2@foodexpress.com', phone: '9876543212', password: ownerPass, role: 'owner' });
  const customer = await User.create({ name: 'John Customer', email: 'user@foodexpress.com', phone: '9876543213', password: userPass, role: 'customer' });

  const categories = await Category.bulkCreate([
    { name: 'Biryani', slug: 'biryani', image: FOOD_IMAGES.biryani },
    { name: 'Pizza', slug: 'pizza', image: FOOD_IMAGES.pizza },
    { name: 'Burgers', slug: 'burgers', image: FOOD_IMAGES.burger },
    { name: 'South Indian', slug: 'south-indian', image: FOOD_IMAGES.dosa },
    { name: 'North Indian', slug: 'north-indian', image: FOOD_IMAGES.curry },
    { name: 'Chinese', slug: 'chinese', image: FOOD_IMAGES.noodles },
    { name: 'Desserts', slug: 'desserts', image: FOOD_IMAGES.dessert },
    { name: 'Healthy', slug: 'healthy', image: FOOD_IMAGES.salad }
  ]);

  const restaurants = await Restaurant.bulkCreate([
    { name: 'Chennai Biryani House', description: 'Authentic Hyderabadi biryani since 1995. Slow-cooked dum biryani with premium basmati rice.', address: 'Anna Nagar, Chennai', image: REST_IMAGES[0], cuisineType: 'South Indian', deliveryTime: 35, priceForTwo: 600, rating: 4.5, offer: '50% OFF up to ₹100', featured: true, ownerId: owner1.id, categoryId: categories[0].id },
    { name: 'Pizza Paradise', description: 'Wood-fired pizzas with fresh ingredients and Italian recipes.', address: 'T Nagar, Chennai', image: REST_IMAGES[1], cuisineType: 'Italian', deliveryTime: 30, priceForTwo: 500, rating: 4.3, offer: 'Buy 1 Get 1 Free', featured: true, ownerId: owner2.id, categoryId: categories[1].id },
    { name: 'Burger Barn', description: 'Juicy gourmet burgers and crispy fries.', address: 'Adyar, Chennai', image: REST_IMAGES[2], cuisineType: 'American', deliveryTime: 25, priceForTwo: 400, rating: 4.1, offer: 'Flat ₹50 OFF', featured: true, ownerId: owner1.id, categoryId: categories[2].id },
    { name: 'Dosa Corner', description: 'Crispy dosas, fluffy idlis, and filter coffee.', address: 'Velachery, Chennai', image: REST_IMAGES[3], cuisineType: 'South Indian', deliveryTime: 20, priceForTwo: 300, rating: 4.6, offer: 'Free delivery', featured: false, ownerId: owner2.id, categoryId: categories[3].id },
    { name: 'Spice Route', description: 'North Indian curries, tandoori, and naan bread.', address: 'OMR, Chennai', image: REST_IMAGES[4], cuisineType: 'North Indian', deliveryTime: 40, priceForTwo: 550, rating: 4.4, offer: '20% OFF', featured: true, ownerId: owner1.id, categoryId: categories[4].id },
    { name: 'Wok & Roll', description: 'Indo-Chinese favorites — noodles, manchurian, and fried rice.', address: 'Porur, Chennai', image: REST_IMAGES[5], cuisineType: 'Chinese', deliveryTime: 30, priceForTwo: 450, rating: 4.0, offer: 'Combo deals', featured: false, ownerId: owner2.id, categoryId: categories[5].id }
  ]);

  await FoodItem.bulkCreate([
    { name: 'Chicken Dum Biryani', description: 'Aromatic basmati rice with tender chicken', price: 280, image: FOOD_IMAGES.biryani, menuCategory: 'Biryani', isVeg: false, restaurantId: restaurants[0].id, calories: 650, protein: 28, carbs: 75, fat: 22, healthScore: 5 },
    { name: 'Mutton Biryani', description: 'Premium mutton slow-cooked with spices', price: 350, image: FOOD_IMAGES.biryani, menuCategory: 'Biryani', isVeg: false, restaurantId: restaurants[0].id, calories: 720, protein: 32, carbs: 70, fat: 28, healthScore: 4 },
    { name: 'Veg Biryani', description: 'Mixed vegetables with fragrant rice', price: 220, image: FOOD_IMAGES.biryani, menuCategory: 'Biryani', isVeg: true, restaurantId: restaurants[0].id, calories: 480, protein: 12, carbs: 80, fat: 10, healthScore: 7 },
    { name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and basil', price: 299, image: FOOD_IMAGES.pizza, menuCategory: 'Pizza', isVeg: true, restaurantId: restaurants[1].id, calories: 800, protein: 28, carbs: 90, fat: 30, healthScore: 4 },
    { name: 'Pepperoni Pizza', description: 'Loaded with pepperoni and cheese', price: 399, image: FOOD_IMAGES.pizza, menuCategory: 'Pizza', isVeg: false, restaurantId: restaurants[1].id, calories: 950, protein: 35, carbs: 85, fat: 45, healthScore: 3 },
    { name: 'Classic Burger', description: 'Beef patty with lettuce, tomato, and special sauce', price: 199, image: FOOD_IMAGES.burger, menuCategory: 'Burgers', isVeg: false, restaurantId: restaurants[2].id, calories: 550, protein: 25, carbs: 45, fat: 28, healthScore: 4 },
    { name: 'Veggie Burger', description: 'Plant-based patty with fresh veggies', price: 179, image: FOOD_IMAGES.burger, menuCategory: 'Burgers', isVeg: true, restaurantId: restaurants[2].id, calories: 420, protein: 15, carbs: 50, fat: 18, healthScore: 6 },
    { name: 'Masala Dosa', description: 'Crispy dosa with potato masala filling', price: 80, image: FOOD_IMAGES.dosa, menuCategory: 'Breakfast', isVeg: true, restaurantId: restaurants[3].id, calories: 350, protein: 8, carbs: 55, fat: 12, healthScore: 7 },
    { name: 'Idli Sambar', description: 'Soft idlis with sambar and chutney', price: 60, image: FOOD_IMAGES.dosa, menuCategory: 'Breakfast', isVeg: true, restaurantId: restaurants[3].id, calories: 280, protein: 10, carbs: 48, fat: 5, healthScore: 8 },
    { name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 320, image: FOOD_IMAGES.curry, menuCategory: 'Main Course', isVeg: false, restaurantId: restaurants[4].id, calories: 580, protein: 35, carbs: 20, fat: 38, healthScore: 4 },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 260, image: FOOD_IMAGES.curry, menuCategory: 'Starters', isVeg: true, restaurantId: restaurants[4].id, calories: 400, protein: 22, carbs: 15, fat: 28, healthScore: 6 },
    { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 180, image: FOOD_IMAGES.noodles, menuCategory: 'Noodles', isVeg: true, restaurantId: restaurants[5].id, calories: 450, protein: 10, carbs: 65, fat: 15, healthScore: 5 },
    { name: 'Chicken Manchurian', description: 'Crispy chicken in tangy sauce', price: 220, image: FOOD_IMAGES.noodles, menuCategory: 'Starters', isVeg: false, restaurantId: restaurants[5].id, calories: 520, protein: 25, carbs: 40, fat: 25, healthScore: 4 },
    { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 150, image: FOOD_IMAGES.dessert, menuCategory: 'Desserts', isVeg: true, restaurantId: restaurants[1].id, calories: 480, protein: 6, carbs: 55, fat: 25, healthScore: 2 },
    { name: 'Greek Salad Bowl', description: 'Fresh greens, feta, olives, and vinaigrette', price: 199, image: FOOD_IMAGES.salad, menuCategory: 'Healthy', isVeg: true, restaurantId: restaurants[3].id, calories: 220, protein: 8, carbs: 15, fat: 14, healthScore: 9 }
  ]);

  await Coupon.bulkCreate([
    { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, minOrder: 199, maxDiscount: 100, isActive: true },
    { code: 'SAVE100', discountType: 'flat', discountValue: 100, minOrder: 499, isActive: true },
    { code: 'BIRYANI50', discountType: 'flat', discountValue: 50, minOrder: 250, isActive: true }
  ]);

  await Review.bulkCreate([
    { rating: 5, comment: 'Best biryani in Chennai! Fast delivery too.', userId: customer.id, restaurantId: restaurants[0].id },
    { rating: 4, comment: 'Great pizza, could use more cheese.', userId: customer.id, restaurantId: restaurants[1].id },
    { rating: 5, comment: 'Crispy dosas every time. Love it!', userId: customer.id, restaurantId: restaurants[3].id }
  ]);

  console.log('Seed complete!');
  console.log('Admin: admin@foodexpress.com / admin123');
  console.log('Owner: owner@foodexpress.com / owner123');
  console.log('Customer: user@foodexpress.com / user1234');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
