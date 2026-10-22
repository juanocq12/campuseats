DROP TABLE IF EXISTS menu;

CREATE TABLE menu (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR(80) NOT NULL UNIQUE,
  categoria VARCHAR(30) NOT NULL,
  precio    INTEGER     NOT NULL CHECK (precio >= 0),
  stock     INTEGER     NOT NULL DEFAULT 0
);

INSERT INTO menu (nombre, categoria, precio, stock) VALUES
  ('Almuerzo del día',     'Almuerzos', 12000, 25),
  ('Almuerzo vegetariano', 'Almuerzos', 11000,  8),
  ('Bandeja paisa',        'Almuerzos', 18000,  0),
  ('Jugo natural',         'Bebidas',    4000, 50),
  ('Café campesino',       'Bebidas',    2500, 100),
  ('Gaseosa',              'Bebidas',    3000,  0),
  ('Agua',                 'Bebidas',    2000, 60),
  ('Empanada',             'Snacks',     2000, 40),
  ('Arepa con queso',      'Snacks',     3500, 15),
  ('Brownie',              'Postres',    4500, 12);

SELECT COUNT(*) AS filas_cargadas FROM menu;