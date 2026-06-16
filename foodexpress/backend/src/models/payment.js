module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    method: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT },
    status: { type: DataTypes.ENUM('pending','paid','failed'), defaultValue: 'pending' }
  });
  return Payment;
};
