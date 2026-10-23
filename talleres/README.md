# Talleres y prácticas de las semanas 1–8

Este índice separa los ejercicios cortos de clase del proyecto principal. Se ejecutan de manera independiente cuando se indica; no cambian la API de producción ni requieren restaurar la base de datos.

| Semana | Evidencia en el repositorio | Cómo practicar |
| --- | --- | --- |
| 1 | Primer script Node.js y consulta HTTP de un usuario por ID en `experimentos/semana-1/`; GET de colección y recurso, POST, PUT y DELETE en Postman, más ejemplos de 404 y JSON mal formado. | `node experimentos/semana-1/index.js "Juan"` o `node experimentos/semana-1/index.js 7`; el ID `999` muestra el caso 404. |
| 2 | Dominio CampusEats, clases, casos de uso, secuencia y BPMN en [`docs/modelado.md`](../docs/modelado.md). | Revisar actores, cardinalidades, tabla intermedia `PedidoItem`, camino de error y carriles del proceso. |
| 3 | API CRUD en memoria con `node:http`, filtro, validación de precio y conflicto por nombre en `experimentos/semana-3/servidor.js`. | `node experimentos/semana-3/servidor.js`; probar `GET/POST/PUT/DELETE /api/productos` y `?disponibles=true`. |
| 4 | La migración de API nativa a Express queda representada por la aplicación principal en `src/routes`, `src/controllers` y `src/services`. | Comparar la API aislada de semana 3 con `npm run dev` en la raíz del proyecto. |
| 5 | Validación REST, errores, CRUD, filtro y PATCH de inventario en la API principal; Postman incluye las cinco operaciones de productos y casos de error. | Importar [`CampusEats.postman_collection.json`](../docs/postman/CampusEats.postman_collection.json). La comparación de JSON/XML/form-data está documentada en [`semana-5-rest.md`](./semana-5-rest.md). |
| 6 | Preparación, nueve consultas SQL, CRUD seguro de usuarios y búsqueda parcial. | Sigue [`semana-6/README.md`](./semana-6/README.md). Los ejercicios SQL usan el esquema `campuseats_practica`, separado de las tablas del proyecto. |
| 7 | Taller guiado de relaciones Prisma, seed repetible, transacciones y rollback, concurrencia, consultas, estados y reporte. | Sigue [`semana-7.md`](./semana-7.md); `npm test` verifica el caso exacto de 20 pedidos concurrentes de 3 unidades con stock 40. |
| 8 | Registro bcrypt, JWT y roles CLIENTE/ADMIN en `src/routes/auth.routes.js` y `src/middlewares/autenticacion.js`. | Importar y probar las solicitudes del grupo “Autenticación” en Postman. El parcial individual de biblioteca no pertenece a estos talleres de CampusEats. |

## Pruebas de los talleres Node

```bash
npm test
```

Los tests de semanas 1 y 3 usan servicios simulados o un puerto local efímero. No dependen de conexión externa ni alteran la base de datos. La prueba SQL crea y elimina un esquema temporal aleatorio dentro de una transacción PostgreSQL; no modifica las tablas de CampusEats.
