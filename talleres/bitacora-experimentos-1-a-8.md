# Bitácora de experimentos: semanas 1–8

Esta guía reúne las evidencias de exploración que complementan los talleres y la aplicación CampusEats. La solución implementada y una observación personal no son lo mismo: ejecuta cada actividad y anota tus propios resultados en la columna de evidencia. No se incluyen resultados medidos ni reflexiones inventadas.

## Antes de empezar

- Haz una copia de seguridad de cualquier base local que contenga datos que quieras conservar.
- Las pruebas que cambian código deben hacerse en una rama o copia descartable y revertirse al terminar. No introduzcas fallos deliberados en la API que uses para una entrega.
- Las pruebas que detienen Docker afectan a todos los proyectos que usen ese contenedor. Hazlas solo si puedes interrumpir el servicio y luego arrancarlo de nuevo.
- Los ejemplos de red dependen de que los sitios externos sigan disponibles y pueden responder distinto según la red, ubicación y fecha.

## Semana 1 — HTTP con lupa

El script [semana-1/index.js](../experimentos/semana-1/index.js) y la colección de [Postman](../docs/postman/CampusEats.postman_collection.json) cubren código de Node, solicitudes y respuestas HTTP. Para guardar la evidencia de los experimentos de red:

1. Cronometra dos veces el mismo sitio HTTPS y registra DNS, TCP, TLS y tiempo total. Anota cuál fase cambió más entre ejecuciones; no compares solo el tiempo total.
2. Ejecuta `curl.exe -I http://www.ucaldas.edu.co` y `curl.exe -I https://www.ucaldas.edu.co`. Registra el estado y cualquier encabezado de redirección.
3. Compara el tamaño del cuerpo de `GET` y los encabezados de `HEAD` para el mismo recurso en `https://jsonplaceholder.typicode.com/users/1`.
4. Solicita un usuario inexistente, una ruta inexistente y envía un JSON mal formado. Registra cada código HTTP y clasifica si el problema corresponde a la solicitud o al servidor.
5. Envía el mismo objeto a `https://httpbin.org/post` con `Content-Type: application/json` y `application/x-www-form-urlencoded`. Compara las secciones `json` y `form` devueltas.

**Evidencia que debes completar:** fecha/red utilizada, estados y tiempos medidos, diferencias observadas y una explicación propia de cada diferencia.

## Semana 2 — decisiones de modelado

Los diagramas de [modelado del dominio](../docs/modelado.md) documentan la decisión final para CampusEats. Para dejar rastro de la comparación:

1. Dibuja un monolito modular y una alternativa de servicios independientes para el dominio. Compara despliegues, aislamiento ante fallos, escalado del catálogo y dependencias de red.
2. Compara una relación directa Pedido–Producto con `PedidoItem`. Verifica si el diseño conserva cantidad y precio histórico, y si permite sumar unidades vendidas.
3. Compara un servicio que recibe `res` con el servicio actual, que devuelve datos y lanza errores de dominio. Indica cuál se puede llamar desde una tarea o una prueba sin servidor HTTP.

**Evidencia que debes completar:** incluye tus dos dibujos o referencias a ellos y las razones por las que el diseño final de CampusEats usa un monolito modular y `PedidoItem`.

## Semana 3 — Node y API nativa

La API aislada está en [semana-3/servidor.js](../experimentos/semana-3/servidor.js); sus pruebas están en [semana-3.test.js](../tests/semana-3.test.js). Ejecuta `npm test` para verificar el comportamiento CRUD sin modificar la base de datos del proyecto. Además, registra:

1. Antes de ejecutar el ejemplo de orden del material de clase, predice la salida y luego compárala con la salida real de las tareas síncronas, promesas, microtareas y temporizadores.
2. Compara una operación de CPU acotada con una espera asíncrona. Observa si una segunda petición puede responder mientras la primera espera. No uses bucles de miles de millones de iteraciones.
3. Compara la lectura de un archivo en modo síncrono y asíncrono; registra el orden de los mensajes, no solo el tiempo.
4. Prueba POST y PATCH contra la API nativa. Esta práctica solo implementa GET, POST, PUT y DELETE; registra la respuesta del método no implementado y la cantidad de código dedicada al enrutamiento.

**Evidencia que debes completar:** predicción, salida observada, explicación y entorno de ejecución (versión de Node y sistema operativo).

## Semana 4 — Express y middleware

La aplicación de CampusEats organiza rutas, controladores y servicios bajo `src/`. No alteres esa aplicación para provocar respuestas bloqueadas. Usa una copia descartable para probar:

1. Cuenta y compara el código de la API nativa y el de Express; separa en tu conteo HTTP/enrutamiento y reglas del dominio.
2. Mueve temporalmente un logger antes y después de las rutas. Pide una ruta existente y una inexistente, y registra cuáles solicitudes aparecen en el log.
3. En una copia, omite temporalmente `next()` en un middleware sin enviar una respuesta. Prueba con un límite de espera corto y luego restaura el middleware.
4. Registra `typeof req.params.id` y compara `"1" === 1`. Convierte el valor explícitamente antes de compararlo; no reemplaces la conversión por igualdad débil.
5. Declara primero una ruta genérica `/:id` y después una ruta literal como `/disponibles`; invierte el orden y compara. Restaura la configuración al final.

**Evidencia que debes completar:** respuesta/log de cada variante y una regla breve que explique el efecto del orden de registro.

## Semana 5 — contratos REST, formatos y validación

La [comparación REST existente](./semana-5-rest.md) describe por qué CampusEats acepta JSON y no habilita XML o multipart sin necesidad. La colección Postman permite probar la API. En una base local de desarrollo:

1. Envía un mismo objeto como JSON y como `text/plain`; registra el `req.body` y el resultado HTTP. No cambies la ruta de producción: usa Postman, un test temporal o una copia local.
2. Prueba datos inválidos, un ID inexistente, un ID no numérico y un nombre duplicado. Registra el código HTTP de cada caso.
3. Repite tres veces un PUT de los mismos datos y un PATCH que descuenta una unidad. Consulta el recurso después de cada solicitud y compara el estado final.
4. Revisa las validaciones existentes. Si quieres observar datos sin validar, hazlo únicamente en una copia descartable, sin persistencia y sin acceso público.
5. Revisa cómo responde el manejador de errores en desarrollo y producción. No introduzcas un error deliberado en un servidor accesible desde internet.

**Evidencia que debes completar:** solicitud, código de respuesta, estado antes/después y explicación de si repetirla es seguro.

## Semana 6 — persistencia, SQL y Prisma

Las consultas de práctica están en [semana-6](./semana-6/README.md) y usan el esquema aislado `campuseats_practica`. No uses tablas de la aplicación para experimentar con cambios destructivos.

1. Activa el log de consultas en una copia de desarrollo y compara el SQL previsto con las consultas generadas por listar, buscar, crear y actualizar.
2. Crea un producto con un nombre único, reinicia solo la API y consulta otra vez. Registra qué persiste.
3. Revisa el `await` del controlador en una copia temporal. Compara la respuesta para un ID existente e inexistente, restaura el archivo y ejecuta las pruebas.
4. Compara la validación de duplicados del servicio con la restricción única de PostgreSQL. La prueba de integración de duplicados ya comprueba que la API responda con conflicto; no desactives la restricción en la base del proyecto.
5. En una base descartable, detén y vuelve a iniciar PostgreSQL mientras la API sigue activa. Registra el código/respuesta en cada fase. No lo hagas si el contenedor presta servicio a otros proyectos.

**Evidencia que debes completar:** consultas observadas, si los datos sobrevivieron a cada reinicio y el comportamiento de recuperación, con fecha y entorno.

## Semana 7 — transacciones y consultas relacionadas

La [guía de semana 7](./semana-7.md) y [las pruebas de integración](../tests/integracion.test.js) cubren rollback, concurrencia y privacidad. El nuevo laboratorio [`lab-n1.mjs`](../experimentos/semana-7/lab-n1.mjs) compara un patrón N+1 con una consulta relacional de Prisma, leyendo como máximo cinco pedidos y sin escribir datos.

Ejecuta desde la raíz, con `.env` apuntando a una base de desarrollo:

```powershell
node experimentos/semana-7/lab-n1.mjs
```

Anota el número de pedidos encontrados y las consultas reportadas en tu ejecución. La cantidad exacta puede variar según la versión/configuración de Prisma; lo importante es comparar ambos enfoques en el mismo entorno. Si no hay pedidos, ejecuta el laboratorio solo si ya tienes datos de prueba; no cargues información personal.

Para los otros experimentos:

1. **Rollback:** la integración provoca un fallo después de reservar inventario y verifica que no queden cambios parciales. Ejecuta `npm test` con las variables de entorno de la base de pruebas.
2. **`tx` frente a `prisma`:** no reemplaces el cliente transaccional en el servicio real; una operación global puede quedar fuera de la transacción. Explica el riesgo usando el flujo de `crearPedido` y el test de rollback.
3. **Privacidad:** verifica en las respuestas públicas que no exista `passwordHash`; la prueba de integración ya lo comprueba.
4. **N+1:** compara los conteos del laboratorio y explica por qué una consulta relacional reduce viajes a la base. El reporte diario usa agregación y consulta de productos en lote.

**Evidencia que debes completar:** salida real del laboratorio, resultado de las pruebas, explicación de cada hallazgo y qué parte fue verificada automáticamente.

## Semana 8 — contraseñas, JWT y autorización

CampusEats implementa bcrypt, JWT y roles; los casos automatizados están en [autenticacion.test.js](../tests/autenticacion.test.js) y en la prueba de integración. Completa las observaciones sin compartir secretos ni usar tokens reales en sitios externos:

1. Genera dos hashes bcrypt de una contraseña de prueba idéntica y comprueba ambos con `bcrypt.compare`. Registra si los hashes coinciden y el tiempo de dos factores de costo moderados. Usa una contraseña ficticia; no guardes contraseñas ni hashes en esta bitácora.
2. Firma un JWT con un secreto de prueba local e inspecciona su payload con `jwt.decode`. Confirma que leer el payload no requiere el secreto. Cambia una parte del token y verifica localmente que `jwt.verify` rechace el token alterado. No copies tokens de la aplicación a jwt.io ni a otro servicio.
3. Compara una petición sin token, una con token CLIENTE contra una ruta ADMIN y una petición ADMIN autorizada. Registra los estados `401`, `403` y el estado permitido. Usa una ruta de lectura o un recurso de prueba que puedas borrar.
4. Comprueba que al crear un pedido el usuario se toma de la identidad autenticada, no de un `usuarioId` enviado por el cliente. La prueba debe usar dos usuarios ficticios en una base de integración; no la ejecutes sobre datos de otra persona.
5. Prueba un token expirado generado localmente con una duración breve y compara la respuesta antes y después del vencimiento. El test automatizado ya verifica un token expirado; no es necesario cambiar la expiración de producción.

**Evidencia que debes completar:** resultados observados con datos ficticios, estado HTTP, entorno y explicación de qué protege el hash, qué protege la firma JWT y qué no oculta el token.

## Registro personal

Para cada actividad que hayas ejecutado, copia y completa una fila en tu cuaderno o en un documento de evidencias:

| Semana/experimento | Predicción | Procedimiento y entorno | Resultado observado | Explicación propia |
| --- | --- | --- | --- | --- |
| | | | | |

No rellenes resultados de medición o predicciones retrospectivamente como si se hubieran hecho antes: separa claramente lo que observaste ahora de lo que ya estaba implementado y probado en el proyecto.
