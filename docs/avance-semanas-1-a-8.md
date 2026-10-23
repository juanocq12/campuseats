# Revisión del avance de CampusEats: semanas 1–8

Este checklist se limita al proyecto académico CampusEats. El parcial práctico de préstamos de biblioteca es individual, separado y no se desarrolla dentro de este repositorio.

| Semana | Tema o evidencia del proyecto | Estado |
| --- | --- | --- |
| 1 | Entorno Node.js y elección de un dominio para el proyecto ABP. | El proyecto está implementado como API Node.js; el dominio CampusEats está descrito en [modelado.md](./modelado.md). |
| 2 | Equipo conformado, dominio, diagramas UML de casos de uso/clases/secuencia, BPMN y repositorio con README. | Dominio, diagramas y repositorio están incluidos. Integrante: Juan Manuel Correa Quiceno; el estudiante informa que el profesor autorizó la modalidad individual. |
| 3 | Fundamentos de Node.js y API HTTP. | CampusEats ya tiene una API HTTP funcional; el servidor del proyecto usa Express, que es la evolución de la API nativa del ejercicio de clase. |
| 4 | Express, middleware, rutas y arquitectura en capas. | Rutas, controladores, servicios, Morgan, errores y scripts npm están en el proyecto. |
| 5 | REST, validación, estados HTTP, errores y colección de Postman. | Endpoints REST, validaciones, errores centralizados y [colección Postman](../postman/CampusEats.postman_collection.json) están incluidos. |
| 6 | PostgreSQL, Prisma, modelos, migraciones y control de inventario. | Esquema, tres migraciones y persistencia PostgreSQL están incluidos; el descuento de inventario es atómico. |
| 7 | Relaciones, seed repetible, pedidos con transacción y rollback, consultas, filtros/paginación, estados y reporte. | Implementado; las pruebas de integración comprueban concurrencia, rollback, permisos, lecturas, cambios de estado y reporte con PostgreSQL. |
| 8 | Hash bcrypt, JWT, autenticación, roles y secretos en `.env`. | Registro/login, middleware JWT, roles `CLIENTE`/`ADMIN`, `.env.example` y rutas protegidas están incluidos. |

Los ejercicios independientes de Node.js, API nativa y SQL de los talleres están en [`talleres/`](../talleres/README.md) y [`experimentos/`](../experimentos). La colección Postman también incluye las cinco solicitudes de diagnóstico HTTP de semana 1.

## Datos por configurar para una instalación nueva

- Configurar las contraseñas locales del seed en `.env`; no deben subirse a GitHub.
- Importar y ejecutar la colección Postman usando las cuentas locales del seed.

## Verificación ejecutada

- `npx prisma migrate status`: base local al día con las tres migraciones.
- `npx prisma validate`: esquema válido.
- `npm test`: 14 pruebas pasan, incluidos los talleres de semanas 1 y 3 y las pruebas de integración SQL y PostgreSQL.
- El seed no se reejecutó contra la base local para evitar restablecer las existencias y contraseñas de datos existentes.
