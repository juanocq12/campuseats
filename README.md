# CampusEats

API de pedidos de comida del campus (Programación web 2).
Estado: Express + capas + validación + manejo de errores + PostgreSQL con Prisma.

## Requisitos

- Docker Desktop
- Node.js 18+
- PostgreSQL corriendo en el puerto 5433 con la base `campuseats`

## Arranque desde cero

```bash
docker start campuseats-db
npm install
npx prisma migrate reset
npx prisma db seed
npm run dev
```

## Endpoints principales

- `GET /api/productos`
- `POST /api/pedidos`

Ejemplo de pedido:

```json
{
  "usuarioId": 2,
  "items": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 4, "cantidad": 1 }
  ]
}
```

La base de datos usa PostgreSQL y el seed crea 2 usuarios y 5 productos con ids conocidos para pruebas.
