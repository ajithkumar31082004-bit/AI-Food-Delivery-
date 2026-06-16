module.exports = (sequelize, DataTypes) => {
  const FoodItem = sequelize.define('FoodItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    image: { type: DataTypes.STRING },
    menuCategory: { type: DataTypes.STRING, defaultValue: 'Main Course' },
    isVeg: { type: DataTypes.BOOLEAN, defaultValue: true },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    calories: { type: DataTypes.INTEGER },
    protein: { type: DataTypes.FLOAT },
    carbs: { type: DataTypes.FLOAT },
    fat: { type: DataTypes.FLOAT },
    healthScore: { type: DataTypes.INTEGER }
  });
  return FoodItem;
};
