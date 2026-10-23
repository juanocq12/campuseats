# CampusEats

API para pedidos de comida del campus, construida progresivamente con los temas de Programación Web 2 de las semanas 1 a 8.

## Tecnologías y temas

- Node.js y Express con arquitectura por capas.
- Validación de datos y manejo centralizado de errores HTTP.
- PostgreSQL y Prisma: modelos, relaciones, migraciones y seed repetible.
- Productos, usuarios, pedidos y detalle de pedido.
- Pedidos transaccionales con control de stock.
- Autenticación con bcrypt y JWT; autorización por roles `CLIENTE` y `ADMIN`.

## Entregables del proyecto

- [Modelado del dominio y diagramas UML/BPMN](./docs/modelado.md), incluyendo casos de uso, clases, secuencia y el proceso BPMN 2.0.
- [Checklist de revisión de semanas 1–8](./docs/avance-semanas-1-a-8.md).
- [Colección oficial de Postman](./postman/CampusEats.postman_collection.json).
- [Hito 1: dominio y diagramas](./docs/modelado.md#hito-1-dominio-y-alcance).
- Hito 2: API por capas con CRUD de productos, pedidos transaccionales, seed, PostgreSQL/Prisma, filtros, paginación y reporte de ventas.
- Semana 8: registro/login, hash bcrypt, JWT y permisos por rol.

## Requisitos

- Node.js 18 o superior.
- Docker Desktop, o PostgreSQL en el puerto `5433`, con la base `campuseats`.

## Configuración y arranque

1. Copia `.env.example` como `.env` y configura `DATABASE_URL`, un `JWT_SECRET` aleatorio de al menos 32 caracteres, `SEED_ADMIN_PASSWORD` y `SEED_CLIENT_PASSWORD`. Las contraseñas de desarrollo del seed deben tener entre 8 y 72 bytes. Puedes generar el secreto con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
2. Inicia el contenedor existente de PostgreSQL:

```bash
docker start campuseats-db
```

Si aún no existe, crea uno con la misma configuración de `.env.example`:

```bash
docker run --name campuseats-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=campuseats -p 5433:5432 -d postgres:17-alpine
```

3. Instala dependencias y prepara la base:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

La API se inicia en `http://localhost:3000`. Para una base local vacía, `npx prisma migrate dev` crea/aplica las migraciones durante el desarrollo. Evita `migrate reset` si no quieres borrar los datos de la base. Al repetir el seed, las contraseñas de las dos cuentas de desarrollo se actualizan con los valores actuales de `.env`.

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
| `GET` | `/api/pedidos` | Autenticado | Lista pedidos propios; `ADMIN` puede filtrar por `estado`, `usuarioId`, `pagina` y `limite` |
| `GET` | `/api/pedidos/:id` | Autenticado | Consulta un pedido propio; `ADMIN` puede consultar cualquiera |
| `PATCH` | `/api/pedidos/:id/estado` | `ADMIN` | Cambia el estado respetando las transiciones del negocio |
| `GET` | `/api/reportes/ventas-dia` | `ADMIN` | Resume pedidos entregados; acepta `?fecha=AAAA-MM-DD` (UTC) |

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

Los estados permitidos son `RECIBIDO -> PREPARANDO -> LISTO -> ENTREGADO`; se puede cancelar desde `RECIBIDO` o `PREPARANDO`. Al cancelar, el inventario se devuelve en la misma transacción. Las transiciones no permitidas responden `409`.

La colección Postman incluye las solicitudes de autenticación, productos, pedidos y reporte. Después de configurar `.env` y ejecutar el seed, importa la colección, completa `clientPassword` y `adminPassword` con las mismas contraseñas de desarrollo, inicia sesión con los dos usuarios para cargar `clientToken` y `adminToken`, y ejecuta las solicitudes del grupo correspondiente. El grupo “Limpieza opcional” borra únicamente el producto temporal creado por la colección. No guardes contraseñas reales en la colección.

## Pruebas

```bash
npm test
```

Las pruebas de integración con PostgreSQL se ejecutan cuando están configurados `DATABASE_URL` y `JWT_SECRET`; de lo contrario, se omiten explícitamente.

## Alcance académico

El repositorio documenta los hitos de modelado y API del proyecto CampusEats y la autenticación vista en semana 8. El parcial práctico de biblioteca es un ejercicio individual separado y no forma parte de este proyecto.
