-- Taller aislado: ejecutar únicamente en una base local de práctica.
-- No borra ni reemplaza datos de las tablas de CampusEats.
CREATE SCHEMA IF NOT EXISTS campuseats_practica;

CREATE TABLE IF NOT EXISTS campuseats_practica.menu (
  id INTEGER PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  categoria VARCHAR(30) NOT NULL,
  precio INTEGER NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

INSERT INTO campuseats_practica.menu (id, nombre, categoria, precio, stock) VALUES
  (1, 'Almuerzo del día', 'Almuerzos', 12000, 25),
  (2, 'Almuerzo vegetariano', 'Almuerzos', 11000, 8),
  (3, 'Bandeja paisa', 'Almuerzos', 18000, 0),
  (4, 'Jugo natural', 'Bebidas', 4000, 50),
  (5, 'Café campesino', 'Bebidas', 2500, 100),
  (6, 'Gaseosa', 'Bebidas', 3000, 0),
  (7, 'Agua', 'Bebidas', 2000, 60),
  (8, 'Empanada', 'Snacks', 2000, 40),
  (9, 'Arepa con queso', 'Snacks', 3500, 15),
  (10, 'Brownie', 'Postres', 4500, 12)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  categoria = EXCLUDED.categoria,
  precio = EXCLUDED.precio,
  stock = EXCLUDED.stock;

SELECT COUNT(*) AS productos_cargados FROM campuseats_practica.menu;
