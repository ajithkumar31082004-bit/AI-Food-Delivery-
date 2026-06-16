module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: { type: DataTypes.ENUM('placed','preparing','picked','out_for_delivery','delivered','cancelled'), defaultValue: 'placed' },
    subtotal: { type: DataTypes.FLOAT, defaultValue: 0 },
    tax: { type: DataTypes.FLOAT, defaultValue: 0 },
    deliveryCharge: { type: DataTypes.FLOAT, defaultValue: 40 },
    total: { type: DataTypes.FLOAT, defaultValue: 0 },
    deliveryAddress: { type: DataTypes.STRING },
    contactPhone: { type: DataTypes.STRING },
    deliveryTimeEstimate: { type: DataTypes.INTEGER },
    deliveryPartner: { type: DataTypes.STRING },
    couponCode: { type: DataTypes.STRING },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 }
  });
  return Order;
};
