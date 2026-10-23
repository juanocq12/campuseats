-- Soluciones del taller SQL. Ejecuta preparar.sql primero.

-- Reto 1
SELECT nombre, precio
FROM campuseats_practica.menu
ORDER BY id;

-- Reto 2
SELECT id, nombre, precio, stock
FROM campuseats_practica.menu
WHERE categoria = 'Snacks'
ORDER BY nombre;

-- Reto 3
SELECT nombre, precio, stock
FROM campuseats_practica.menu
WHERE stock > 0 AND precio < 3000
ORDER BY precio, nombre;

-- Reto 4
SELECT nombre, precio
FROM campuseats_practica.menu
ORDER BY precio DESC, id
LIMIT 5;

-- Reto 5
SELECT COUNT(*) AS total_productos
FROM campuseats_practica.menu;

-- Reto 6
SELECT categoria, COUNT(*) AS total_productos
FROM campuseats_practica.menu
GROUP BY categoria
ORDER BY categoria;

-- Reto 7
SELECT categoria, SUM(precio * stock) AS valor_inventario
FROM campuseats_practica.menu
GROUP BY categoria
ORDER BY valor_inventario DESC, categoria;

-- Reto 8
UPDATE campuseats_practica.menu
SET stock = stock - 1
WHERE nombre = 'Empanada' AND stock >= 1
RETURNING id, nombre, stock;

-- Reto 9
SELECT constraint_row.conname, pg_get_constraintdef(constraint_row.oid) AS definicion
FROM pg_constraint AS constraint_row
WHERE constraint_row.conrelid = 'campuseats_practica.menu'::regclass
  AND constraint_row.contype IN ('u', 'c')
ORDER BY constraint_row.conname;
