-- ============================================================
-- FoodExpress PostgreSQL Schema for Supabase
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Drop existing types if re-running
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS discount_type CASCADE;

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'owner', 'admin');
CREATE TYPE order_status AS ENUM ('placed', 'preparing', 'picked', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE discount_type AS ENUM ('percentage', 'flat');

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS "Users" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'customer',
  avatar VARCHAR(500),
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE IF NOT EXISTS "Categories" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  image VARCHAR(500),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Restaurants
-- ============================================================
CREATE TABLE IF NOT EXISTS "Restaurants" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address VARCHAR(500),
  image VARCHAR(500),
  "cuisineType" VARCHAR(100),
  "deliveryTime" INT DEFAULT 30,
  "priceForTwo" FLOAT DEFAULT 500,
  rating FLOAT DEFAULT 0,
  offer VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  "isOpen" BOOLEAN DEFAULT TRUE,
  "ownerId" INT REFERENCES "Users"(id) ON DELETE SET NULL,
  "categoryId" INT REFERENCES "Categories"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FoodItems
-- ============================================================
CREATE TABLE IF NOT EXISTS "FoodItems" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  image VARCHAR(500),
  "menuCategory" VARCHAR(100) DEFAULT 'Main Course',
  "isVeg" BOOLEAN DEFAULT TRUE,
  available BOOLEAN DEFAULT TRUE,
  calories INT,
  protein FLOAT,
  carbs FLOAT,
  fat FLOAT,
  "healthScore" INT,
  "restaurantId" INT NOT NULL REFERENCES "Restaurants"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Addresses
-- ============================================================
CREATE TABLE IF NOT EXISTS "Addresses" (
  id SERIAL PRIMARY KEY,
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  "postalCode" VARCHAR(20),
  "isDefault" BOOLEAN DEFAULT FALSE,
  "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Carts
-- ============================================================
CREATE TABLE IF NOT EXISTS "Carts" (
  id SERIAL PRIMARY KEY,
  items JSONB DEFAULT '[]',
  "userId" INT NOT NULL UNIQUE REFERENCES "Users"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS "Orders" (
  id SERIAL PRIMARY KEY,
  status order_status DEFAULT 'placed',
  subtotal FLOAT DEFAULT 0,
  tax FLOAT DEFAULT 0,
  "deliveryCharge" FLOAT DEFAULT 40,
  total FLOAT DEFAULT 0,
  "deliveryAddress" VARCHAR(500),
  "contactPhone" VARCHAR(20),
  "deliveryTimeEstimate" INT,
  "deliveryPartner" VARCHAR(255),
  "couponCode" VARCHAR(50),
  discount FLOAT DEFAULT 0,
  "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "restaurantId" INT REFERENCES "Restaurants"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OrderItems
-- ============================================================
CREATE TABLE IF NOT EXISTS "OrderItems" (
  id SERIAL PRIMARY KEY,
  quantity INT DEFAULT 1,
  price FLOAT,
  "orderId" INT NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  "foodItemId" INT REFERENCES "FoodItems"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Payments
-- ============================================================
CREATE TABLE IF NOT EXISTS "Payments" (
  id SERIAL PRIMARY KEY,
  method VARCHAR(50),
  amount FLOAT,
  status payment_status DEFAULT 'pending',
  "orderId" INT NOT NULL UNIQUE REFERENCES "Orders"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS "Reviews" (
  id SERIAL PRIMARY KEY,
  rating INT,
  comment TEXT,
  "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "restaurantId" INT NOT NULL REFERENCES "Restaurants"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS "Favorites" (
  id SERIAL PRIMARY KEY,
  "userId" INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
  "restaurantId" INT NOT NULL REFERENCES "Restaurants"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "restaurantId")
);

-- ============================================================
-- Coupons
-- ============================================================
CREATE TABLE IF NOT EXISTS "Coupons" (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  "discountType" discount_type DEFAULT 'percentage',
  "discountValue" FLOAT NOT NULL,
  "minOrder" FLOAT DEFAULT 0,
  "maxDiscount" FLOAT,
  "expiresAt" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT TRUE,
  "userId" INT REFERENCES "Users"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Auto-update updatedAt via trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'Users', 'Categories', 'Restaurants', 'FoodItems', 'Addresses',
    'Carts', 'Orders', 'OrderItems', 'Payments', 'Reviews', 'Favorites', 'Coupons'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%s_updated_at ON "%s";
       CREATE TRIGGER update_%s_updated_at
       BEFORE UPDATE ON "%s"
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      lower(t), t, lower(t), t
    );
  END LOOP;
END;
$$;
