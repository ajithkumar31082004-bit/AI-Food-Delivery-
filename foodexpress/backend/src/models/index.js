const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || '127.0.0.1',
  dialect: 'mysql',
  logging: false,
});

const db = { sequelize, Sequelize };

db.User = require('./user')(sequelize, Sequelize);
db.Restaurant = require('./restaurant')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.FoodItem = require('./fooditem')(sequelize, Sequelize);
db.Address = require('./address')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);
db.OrderItem = require('./orderitem')(sequelize, Sequelize);
db.Cart = require('./cart')(sequelize, Sequelize);
db.Payment = require('./payment')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);
db.Favorite = require('./favorite')(sequelize, Sequelize);
db.Coupon = require('./coupon')(sequelize, Sequelize);

// User associations
db.User.hasMany(db.Address, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Address.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Restaurant, { foreignKey: 'ownerId' });
db.Restaurant.belongsTo(db.User, { as: 'owner', foreignKey: 'ownerId' });

db.User.hasOne(db.Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Cart.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Order, { foreignKey: 'userId' });
db.Order.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Review, { foreignKey: 'userId' });
db.Review.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Favorite.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Coupon, { foreignKey: 'userId' });
db.Coupon.belongsTo(db.User, { foreignKey: 'userId' });

// Category & Restaurant
db.Category.hasMany(db.Restaurant, { foreignKey: 'categoryId' });
db.Restaurant.belongsTo(db.Category, { foreignKey: 'categoryId' });

// Restaurant associations
db.Restaurant.hasMany(db.FoodItem, { foreignKey: 'restaurantId', onDelete: 'CASCADE' });
db.FoodItem.belongsTo(db.Restaurant, { foreignKey: 'restaurantId' });

db.Restaurant.hasMany(db.Order, { foreignKey: 'restaurantId' });
db.Order.belongsTo(db.Restaurant, { foreignKey: 'restaurantId' });

db.Restaurant.hasMany(db.Review, { foreignKey: 'restaurantId' });
db.Review.belongsTo(db.Restaurant, { foreignKey: 'restaurantId' });

db.Restaurant.hasMany(db.Favorite, { foreignKey: 'restaurantId', onDelete: 'CASCADE' });
db.Favorite.belongsTo(db.Restaurant, { foreignKey: 'restaurantId' });

// Order associations
db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });

db.OrderItem.belongsTo(db.FoodItem, { foreignKey: 'foodItemId' });
db.FoodItem.hasMany(db.OrderItem, { foreignKey: 'foodItemId' });

db.Order.hasOne(db.Payment, { foreignKey: 'orderId', onDelete: 'CASCADE' });
db.Payment.belongsTo(db.Order, { foreignKey: 'orderId' });

module.exports = db;
