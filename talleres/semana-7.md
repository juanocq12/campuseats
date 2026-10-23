# Taller de semana 7: Prisma II, relaciones, transacciones y consultas

Esta guía desarrolla en CampusEats los pasos del taller de la semana 7. La solución usa PostgreSQL y Prisma 7, y mantiene la base del proyecto. No ejecutes `prisma migrate reset`: las pruebas crean registros temporales con UUID y los eliminan al terminar.

## 1. Preparar y revisar las relaciones

Desde la raíz del proyecto, configura `.env` con `DATABASE_URL` y `JWT_SECRET`, inicia PostgreSQL y aplica las migraciones:

```bash
docker start campuseats-db
npx prisma migrate deploy
npx prisma generate
```

El esquema de [`prisma/schema.prisma`](../prisma/schema.prisma) expresa:

- Un `Usuario` tiene muchos `Pedido` (`Usuario.pedidos` y `Pedido.usuarioId`).
- Un `Pedido` contiene muchos `PedidoItem`; cada producto aparece en muchos ítems. `PedidoItem` es la tabla intermedia con `cantidad` y `precioUnitario`.
- El precio unitario del ítem y el total del pedido guardan el valor histórico de la compra.

Inspecciona las migraciones en `prisma/migrations/` y encuentra sus `FOREIGN KEY`. `Pedido.usuarioId`, `PedidoItem.pedidoId` y `PedidoItem.productoId` son las columnas que materializan las relaciones en PostgreSQL.

## 2. Sembrar datos repetibles

El seed está configurado en [`prisma7.config.ts`](../prisma7.config.ts) y ejecuta upserts para dos usuarios y cinco productos:

```bash
npx prisma db seed
```

Se puede repetir sin duplicar usuarios ni productos. El seed restablece los datos conocidos de esos productos y actualiza las contraseñas a los valores configurados en `.env`; no lo ejecutes en una base cuyos cambios quieras conservar.

## 3. Crear un pedido atómico

Inicia la API con `npm run dev` y autentica un cliente desde la colección [`CampusEats.postman_collection.json`](../docs/postman/CampusEats.postman_collection.json). Crea un pedido con uno o más ítems en `POST /api/pedidos`:

```json
{
  "items": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 4, "cantidad": 3 }
  ]
}
```

El servicio obtiene usuario y precios desde la base, descuenta stock con una condición atómica, calcula el total y crea el pedido con sus ítems dentro de `$transaction`. No acepta el precio ni el usuario desde el cuerpo de la solicitud.

Si el segundo producto no existe o no tiene stock, la API responde `404` o `409`. El error aborta la transacción: el stock descontado previamente vuelve a su valor original y no queda un pedido incompleto. La prueba de integración verifica el rollback de dos productos.

## 4. Comprobar concurrencia

La prueba de integración reproduce el experimento del taller: 20 pedidos simultáneos de 3 unidades cada uno sobre un producto con stock 40. Alcanza para 13 pedidos completos. La condición `stock >= cantidad` viaja en el `UPDATE`; una transacción no puede vender lo que otra ya reservó.

Resultado esperado, comprobado automáticamente:

| Pedidos | Resultado |
| --- | --- |
| 13 | `201 Created` |
| 7 | `409 Conflict` |
| Stock final | 1 |

Ejecuta `npm test` con `DATABASE_URL` y `JWT_SECRET` configurados para correr la prueba con PostgreSQL.

## 5. Consultar pedidos, estados y ventas

- `GET /api/pedidos/:id` y `GET /api/pedidos` devuelven usuario e ítems mediante `select`, sin exponer `passwordHash`.
- El listado admite filtros de estado y usuario para administradores, además de paginación `pagina`/`limite`.
- `PATCH /api/pedidos/:id/estado` valida el flujo de estados. Una transición inválida responde `409`; cancelar devuelve el inventario dentro de una transacción.
- `GET /api/reportes/ventas-dia?fecha=AAAA-MM-DD` devuelve `fecha`, `totalVendido`, `pedidos` y `unidadesPorProducto`. Incluye pedidos del día que no estén cancelados y excluye los cancelados. Las unidades se agrupan por producto y los nombres se consultan en lote, sin N+1.

La colección Postman contiene el flujo de crear, consultar, listar y cambiar estado, más casos de error para `400` (ítems vacíos), `404` (producto inexistente) y `409` (stock insuficiente y transición desde un pedido entregado).
