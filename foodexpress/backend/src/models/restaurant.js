module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    address: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    cuisineType: { type: DataTypes.STRING },
    deliveryTime: { type: DataTypes.INTEGER, defaultValue: 30 },
    priceForTwo: { type: DataTypes.FLOAT, defaultValue: 500 },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    offer: { type: DataTypes.STRING },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
  return Restaurant;
};
