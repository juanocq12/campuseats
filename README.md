# CampusEats

API para pedidos de comida del campus, construida progresivamente con los temas de Programación Web 2 de las semanas 1 a 8.

## Tecnologías y temas

- Node.js y Express con arquitectura por capas.
- Validación de datos y manejo centralizado de errores HTTP.
- PostgreSQL y Prisma: modelos, relaciones, migraciones y seed repetible.
- Productos, usuarios, pedidos y detalle de pedido.
- Pedidos transaccionales con control de stock.
- Autenticación con bcrypt y JWT; autorización por roles `CLIENTE` y `ADMIN`.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL en el puerto `5433`, con la base `campuseats`.

## Configuración y arranque

1. Copia `.env.example` como `.env`.
2. Configura `DATABASE_URL`, un `JWT_SECRET` aleatorio de al menos 32 caracteres y contraseñas de desarrollo de 8 a 72 bytes para los usuarios del seed. Puedes generar el secreto con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
3. Instala dependencias y prepara la base:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

Para una base local vacía, `npx prisma migrate dev` crea/aplica las migraciones durante el desarrollo. Evita `migrate reset` si no quieres borrar los datos de la base.

## Usuarios de desarrollo

El seed crea o actualiza estos usuarios. Las contraseñas se definen localmente en `.env` y se guardan como hashes bcrypt; no uses contraseñas reales en los valores de desarrollo.

| Rol | Email |
| --- | --- |
| `ADMIN` | `admin@campuseats.co` |
| `CLIENTE` | `ana@ucaldas.edu.co` |

El seed repone el hash de cada contraseña según las variables `SEED_ADMIN_PASSWORD` y `SEED_CLIENT_PASSWORD` cada vez que se ejecuta.

## Endpoints

### Autenticación

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Público | Registra un usuario con rol `CLIENTE` |
| `POST` | `/api/auth/login` | Público | Devuelve el perfil y un JWT con expiración de 2 horas |
| `GET` | `/api/auth/me` | Autenticado | Devuelve el perfil de quien inició sesión |

Registro:

```json
{
  "nombre": "Ana Estudiante",
  "email": "ana@ucaldas.edu.co",
  "password": "una-clave-de-desarrollo"
}
```

Inicio de sesión:

```json
{
  "email": "ana@ucaldas.edu.co",
  "password": "una-clave-de-desarrollo"
}
```

En rutas protegidas, envía el token en la cabecera:

```text
Authorization: Bearer <token>
```

### Productos y pedidos

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/productos` | Público | Lista productos; admite `?disponibles=true` y `?buscar=texto` |
| `GET` | `/api/productos/:id` | Público | Consulta un producto |
| `POST` | `/api/productos` | `ADMIN` | Crea un producto |
| `PUT` | `/api/productos/:id` | `ADMIN` | Actualiza un producto |
| `PATCH` | `/api/productos/:id/stock` | `ADMIN` | Ajusta el inventario |
| `DELETE` | `/api/productos/:id` | `ADMIN` | Elimina un producto |
| `POST` | `/api/pedidos` | Autenticado | Crea un pedido para el usuario del token |

Ejemplo de pedido:

```json
{
  "items": [
    { "productoId": 1, "cantidad": 2 },
    { "productoId": 4, "cantidad": 1 }
  ]
}
```

El servidor calcula el total y descuenta el inventario dentro de una transacción. El cliente no puede elegir el `usuarioId` del pedido ni asignarse un rol `ADMIN` al registrarse.
