module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    discountType: { type: DataTypes.ENUM('percentage', 'flat'), defaultValue: 'percentage' },
    discountValue: { type: DataTypes.FLOAT, allowNull: false },
    minOrder: { type: DataTypes.FLOAT, defaultValue: 0 },
    maxDiscount: { type: DataTypes.FLOAT },
    expiresAt: { type: DataTypes.DATE },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    userId: { type: DataTypes.INTEGER, allowNull: true }
  });
  return Coupon;
};
