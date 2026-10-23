# Taller de semana 6: PostgreSQL, Prisma y consultas

## Consultas SQL

Los retos trabajan sobre el esquema aislado `campuseats_practica`, dentro de la base local `campuseats`. Para preparar los diez productos desde la raíz del repositorio:

```bash
docker exec -i campuseats-db psql -U postgres -d campuseats < talleres/semana-6/preparar.sql
```

Resuelve primero [`retos.sql`](./retos.sql) y consulta después [`soluciones.sql`](./soluciones.sql). Incluye selección, filtros, orden, agregaciones, actualización condicional de inventario y revisión de restricciones. El script es repetible y no borra ni modifica las tablas de la aplicación.

## Aplicación CampusEats

La API principal aplica los demás ejercicios de la sesión:

- PostgreSQL con Prisma 7, configuración, modelos, migraciones versionadas y cliente generado.
- Productos persistidos en la base y consulta de migraciones.
- Control de unicidad y descuento condicional del stock para impedir existencias negativas.
- Búsqueda parcial e insensible a mayúsculas: `GET /api/productos?buscar=JUGO`.
- Listado, detalle y alta de usuarios con `GET /api/usuarios`, `GET /api/usuarios/:id` y `POST /api/usuarios`. Estas rutas requieren rol `ADMIN`; las respuestas usan campos públicos y nunca incluyen `passwordHash`. Las contraseñas se guardan con bcrypt, conforme al refuerzo de seguridad visto en semana 8.

Importa [`CampusEats.postman_collection.json`](../../docs/postman/CampusEats.postman_collection.json), inicia sesión como administrador y prueba las rutas de productos y usuarios. Las pruebas de integración de PostgreSQL comprueban duplicados, permisos, concurrencia y rollback con datos temporales.
