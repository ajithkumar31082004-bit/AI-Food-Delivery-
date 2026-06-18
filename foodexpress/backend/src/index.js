require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const foodRoutes = require('./routes/food');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const ownerRoutes = require('./routes/owner');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] }
});
app.set('io', io);

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.get('/', (req, res) => res.json({ message: 'FoodExpress API', version: '1.0.0' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);

io.on('connection', (socket) => {
  socket.on('joinOrder', (orderId) => {
    socket.join(`order-${orderId}`);
  });

  socket.on('simulateDelivery', async (orderId) => {
    const statuses = ['preparing', 'picked', 'out_for_delivery', 'delivered'];
    for (const status of statuses) {
      await new Promise(r => setTimeout(r, 5000));
      io.to(`order-${orderId}`).emit('orderUpdate', { id: orderId, status });
    }
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    server.listen(PORT, () => console.log(`FoodExpress server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
  }
}

start();
