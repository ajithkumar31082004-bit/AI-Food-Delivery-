# FoodExpress / FoodGPT

A production-ready, AI-powered food delivery platform similar to Swiggy and Zomato.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, Redux Toolkit, React Router, Axios, Socket.io-client |
| Backend | Node.js, Express, Sequelize, JWT, bcrypt, Socket.io |
| Database | MySQL |
| AI | Google Gemini API (FoodGPT) |
| Deployment | Nginx |

## Features

### Customer
- Register / Login with JWT authentication
- Browse & search restaurants with smart AI filters
- Add to cart, checkout with GST & delivery charges
- UPI, Card, and Cash on Delivery payments
- Real-time order tracking (Socket.io)
- Order history, saved addresses, favorites
- Rate restaurants with AI review summaries

### Restaurant Owner
- Dashboard with orders, revenue, popular foods
- Menu management (add/edit/delete, availability)
- Order status management
- AI restaurant description generator
- AI order forecasting & peak hour insights

### Admin
- Manage users, restaurants, categories, orders
- Platform analytics & revenue reports

### AI Features (FoodGPT)
- AI Food Assistant chatbot
- Personalized meal recommendations
- Natural language smart search
- AI review summarizer
- Nutrition analyzer per food item
- AI coupon generator
- Order forecasting for restaurants
- 24/7 AI customer support
- Voice food ordering (Web Speech API)

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- Gemini API key (optional, for AI features)

### 1. Database Setup

```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and GEMINI_API_KEY
npm install
npm run seed    # Seed demo data
npm run dev     # Start on port 5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm start       # Start on port 3000
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | user@foodexpress.com | user1234 |
| Owner | owner@foodexpress.com | owner123 |
| Admin | admin@foodexpress.com | admin123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user

### Restaurants
- `GET /api/restaurants` — List (with filters)
- `GET /api/restaurants/:id` — Details + AI review summary
- `POST /api/restaurants/:id/reviews` — Add review

### Food
- `GET /api/food/search?q=` — AI smart search
- `GET /api/food/menu/:restaurantId` — Menu

### Cart
- `GET /api/cart` — Get cart
- `POST /api/cart/add` — Add item
- `PUT /api/cart/update` — Update quantity
- `DELETE /api/cart/remove/:id` — Remove item

### Orders
- `POST /api/orders/place` — Place order
- `GET /api/orders/history` — Order history
- `GET /api/orders/track/:id` — Track order
- `PUT /api/orders/cancel/:id` — Cancel order

### AI (FoodGPT)
- `POST /api/ai/assistant` — Food assistant chat
- `GET /api/ai/recommendations` — Meal recommendations
- `POST /api/ai/support` — Customer support
- `POST /api/ai/voice-order` — Parse voice orders
- `GET /api/ai/nutrition/:foodId` — Nutrition info

### Admin / Owner
- `GET /api/admin/stats` — Platform analytics
- `GET /api/owner/stats` — Restaurant analytics
- CRUD endpoints for users, restaurants, categories, menu

## Deployment (Nginx)

1. Build frontend: `cd frontend && npm run build`
2. Copy `nginx.conf` to `/etc/nginx/sites-available/foodexpress`
3. Point `root` to your frontend build directory
4. Run backend with PM2: `pm2 start backend/src/index.js --name foodexpress-api`

## Environment Variables

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodexpress
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

## Project Structure

```
foodexpress/
├── backend/
│   ├── src/
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── middleware/    # Auth, validation
│   │   ├── services/     # Gemini AI service
│   │   ├── index.js      # Server + Socket.io
│   │   └── seed.js       # Demo data
│   └── schema.sql        # MySQL schema
├── frontend/
│   └── src/
│       ├── components/   # Navbar, Footer, AI Chatbot, etc.
│       ├── pages/        # All app pages
│       ├── store/        # Redux slices
│       └── services/     # API & Socket clients
└── nginx.conf
```
