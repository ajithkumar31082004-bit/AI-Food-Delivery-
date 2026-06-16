module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    items: { type: DataTypes.JSON, defaultValue: [] }
  });
  return Cart;
};
