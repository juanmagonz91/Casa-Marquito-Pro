-- ── Casa Marquito — Schema PostgreSQL ───────────────────────────────────────

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(10)    PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  price       NUMERIC(10,2)  NOT NULL,
  category    VARCHAR(100)   NOT NULL,
  image_url   TEXT,
  description TEXT,
  stock       INTEGER        NOT NULL DEFAULT 10
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(50)    PRIMARY KEY,
  date             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  subtotal         NUMERIC(10,2)  NOT NULL,
  discount         NUMERIC(10,2)  NOT NULL DEFAULT 0,
  shipping_cost    NUMERIC(10,2)  NOT NULL DEFAULT 0,
  total            NUMERIC(10,2)  NOT NULL,
  status           VARCHAR(20)    NOT NULL DEFAULT 'pending',
  payment_method   VARCHAR(100),
  customer_name    VARCHAR(255),
  customer_email   VARCHAR(255),
  customer_phone   VARCHAR(50),
  document_number  VARCHAR(50),
  shipping_address JSONB
);

-- Tabla de ítems de cada pedido
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL         PRIMARY KEY,
  order_id     VARCHAR(50)    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   VARCHAR(10),
  product_name VARCHAR(255)   NOT NULL,
  price        NUMERIC(10,2)  NOT NULL,
  quantity     INTEGER        NOT NULL DEFAULT 1
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
