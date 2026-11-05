# CampusEats

API para pedidos de comida del campus, construida progresivamente con los temas de Programación Web 2 de las semanas 1 a 9.

## Tecnologías y temas

- Node.js y Express con arquitectura por capas.
- Validación de datos y manejo centralizado de errores HTTP.
- PostgreSQL y Prisma: modelos, relaciones, migraciones y seed repetible.
- Productos, usuarios, pedidos y detalle de pedido.
- Pedidos transaccionales con control de stock.
- Autenticación con bcrypt y JWT; autorización por roles `CLIENTE` y `ADMIN`.
- Semana 9: correo transaccional, carga de fotos, SMS con proveedor intercambiable y conversión COP/USD con timeout.
- Semana 10: Socket.IO autenticado con JWT, salas privadas por usuario y rol, y eventos de pedidos en tiempo real.

## Entregables del proyecto

- [Modelado del dominio y diagramas UML/BPMN](./docs/modelado.md), incluyendo casos de uso, clases, secuencia y el proceso BPMN 2.0.
- [Diagramas UML y BPMN exportados como SVG](./docs/diagramas/).
- [Checklist de revisión de semanas 1–8](./docs/avance-semanas-1-a-8.md).
- [Talleres y prácticas de las semanas 1–8](./talleres/README.md), con guías específicas y bitácora de experimentos.
- [Colección oficial de Postman](./docs/postman/CampusEats.postman_collection.json).
- [Hito 1: dominio y diagramas](./docs/modelado.md#hito-1-dominio-y-alcance).
- Hito 2: API por capas con CRUD de productos, pedidos transaccionales, seed, PostgreSQL/Prisma, filtros, paginación y reporte de ventas.
- Semana 8: registro/login, hash bcrypt, JWT y permisos por rol.
- Semana 10: demo REST + Socket.IO en [`public/demo-tiempo-real.html`](./public/demo-tiempo-real.html).

## Tiempo real (Semana 10)

El servidor HTTP de Express comparte puerto con Socket.IO. Cada conexión envía su JWT en `auth.token`; el servidor verifica firma, expiración e identidad y la incorpora únicamente a `usuario:<id>` y `rol:<rol>`. El cliente no puede elegir salas. Los eventos son:

| Evento | Destino | Cuándo |
| --- | --- | --- |
| `pedido:creado` | `rol:ADMIN` | Se crea un pedido. |
| `pedido:estado` | `usuario:<id>` del propietario | Cambia el estado de su pedido. |
| `pedido:actualizado` | `rol:ADMIN` | Cambia el estado de un pedido. |

Con la API iniciada, abre `http://localhost:3000/demo-tiempo-real.html`, pega el JWT y el ID de un pedido. La página consulta primero `GET /api/pedidos/:id`; después abre Socket.IO y refleja los cambios sin recargar. Usa un token de ADMIN para observar los eventos dirigidos a su sala de rol. Para la demo de privacidad, conecta a Ana, Beto y ADMIN en ventanas separadas y cambia el estado de un pedido de Ana.

## Requisitos

- Node.js 18 o superior.
- Docker Desktop, o PostgreSQL en el puerto `5433`, con la base `campuseats`.

## Configuración y arranque

1. Copia `.env.example` como `.env` y configura `DATABASE_URL`, un `JWT_SECRET` aleatorio de al menos 32 caracteres, `SEED_ADMIN_PASSWORD` y `SEED_CLIENT_PASSWORD`. Las contraseñas de desarrollo del seed deben tener entre 8 y 72 bytes. Puedes generar el secreto con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
2. Para correo de prueba, agrega las credenciales de Ethereal a `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` y `SMTP_PASS`. Sin credenciales, los pedidos siguen creándose y el error del correo queda en la consola. Para SMS local deja `SMS_PROVEEDOR=simulado`; Twilio es opcional y requiere `SMS_PROVEEDOR=twilio`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_FROM`.
3. Inicia el contenedor existente de PostgreSQL:

```bash
docker start campuseats-db
```

Si aún no existe, crea uno con la misma configuración de `.env.example`:

```bash
docker run --name campuseats-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=campuseats -p 5433:5432 -d postgres:17-alpine
```

4. Instala dependencias y prepara la base:

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

### Usuarios (ADMIN)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/usuarios` | `ADMIN` | Lista usuarios sin exponer `passwordHash` |
| `GET` | `/api/usuarios/:id` | `ADMIN` | Consulta un usuario sin exponer `passwordHash` |
| `POST` | `/api/usuarios` | `ADMIN` | Crea un cliente y guarda su contraseña con bcrypt |

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
| `GET` | `/api/productos/:id/precio-usd` | Público | Consulta el precio en COP y su conversión a USD; si la API de tasas falla, devuelve `usd: null` |
| `POST` | `/api/productos/:id/imagen` | `ADMIN` | Recibe una imagen JPG, PNG o WebP de hasta 2 MB en form-data con el campo `imagen` |
| `POST` | `/api/productos` | `ADMIN` | Crea un producto |
| `PUT` | `/api/productos/:id` | `ADMIN` | Actualiza un producto |
| `PATCH` | `/api/productos/:id/stock` | `ADMIN` | Ajusta el inventario |
| `DELETE` | `/api/productos/:id` | `ADMIN` | Elimina un producto |
| `POST` | `/api/pedidos` | Autenticado | Crea un pedido para el usuario del token |
| `GET` | `/api/pedidos` | Autenticado | Lista pedidos propios; `ADMIN` puede filtrar por `estado`, `usuarioId`, `pagina` y `limite` |
| `GET` | `/api/pedidos/:id` | Autenticado | Consulta un pedido propio; `ADMIN` puede consultar cualquiera |
| `PATCH` | `/api/pedidos/:id/estado` | `ADMIN` | Cambia el estado respetando las transiciones del negocio |
| `GET` | `/api/reportes/ventas-dia` | `ADMIN` | Resume pedidos no cancelados y unidades por producto; acepta `?fecha=AAAA-MM-DD` (UTC) |

### Política de acceso por endpoint y rol

`Público` indica que no se requiere iniciar sesión. `Sí` indica acceso permitido; `No` indica acceso denegado. Para los pedidos de un cliente, el servidor limita las consultas a la identidad autenticada: nunca toma el propietario desde un parámetro enviado por el cliente.

| Endpoint | Público | `CLIENTE` | `ADMIN` | Regla de acceso |
| --- | --- | --- | --- | --- |
| `POST /api/auth/register` | Sí | Sí | Sí | El registro público siempre asigna el rol `CLIENTE`. |
| `POST /api/auth/login` | Sí | Sí | Sí | Emite un JWT después de validar las credenciales. |
| `GET /api/auth/me` | No | Sí | Sí | Devuelve el perfil de la identidad del token. |
| `GET /api/productos` | Sí | Sí | Sí | Consulta de catálogo. |
| `GET /api/productos/:id` | Sí | Sí | Sí | Consulta de producto. |
| `POST /api/productos` | No | No | Sí | Administración del catálogo. |
| `PUT /api/productos/:id` | No | No | Sí | Administración del catálogo. |
| `PATCH /api/productos/:id/stock` | No | No | Sí | Administración del inventario. |
| `DELETE /api/productos/:id` | No | No | Sí | Administración del catálogo. |
| `GET /api/usuarios` | No | No | Sí | Lista perfiles públicos; nunca incluye `passwordHash`. |
| `GET /api/usuarios/:id` | No | No | Sí | Consulta un perfil público; nunca incluye `passwordHash`. |
| `POST /api/usuarios` | No | No | Sí | Crea un cliente y almacena su contraseña con bcrypt. |
| `POST /api/pedidos` | No | Sí | Sí | Crea el pedido para `req.usuario.id`; ignora cualquier propietario indicado en el body. |
| `GET /api/pedidos` | No | Sí | Sí | `CLIENTE` solo lista sus pedidos (`req.usuario.id`); `ADMIN` puede filtrar por `usuarioId`. |
| `GET /api/pedidos/:id` | No | Sí* | Sí | `CLIENTE` solo consulta pedidos propios; `ADMIN` puede consultar cualquiera. |
| `PATCH /api/pedidos/:id/estado` | No | No | Sí | Solo administración puede cambiar estados. |
| `GET /api/reportes/ventas-dia` | No | No | Sí | Solo administración puede consultar el reporte. |

`*` Para `CLIENTE`, si el pedido existe pero pertenece a otra persona, la API responde como si no existiera (`404`).

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

La colección Postman incluye las solicitudes de autenticación, usuarios, productos, pedidos, reporte y servicios externos de la semana 9. Después de configurar `.env` y ejecutar el seed, importa la colección, completa `clientPassword` y `adminPassword` con las mismas contraseñas de desarrollo, inicia sesión con los dos usuarios para cargar `clientToken` y `adminToken`, y ejecuta las solicitudes del grupo correspondiente. Para subir una foto, selecciona un archivo en el campo form-data `imagen`. No guardes contraseñas reales en la colección.

## Pruebas

```bash
npm test
```

Las pruebas de integración con PostgreSQL se ejecutan cuando están configurados `DATABASE_URL` y `JWT_SECRET`; de lo contrario, se omiten explícitamente.

## Alcance académico

El repositorio documenta los hitos de modelado y API del proyecto CampusEats hasta la semana 9. El parcial práctico de biblioteca es un ejercicio individual separado y no forma parte de este proyecto.
