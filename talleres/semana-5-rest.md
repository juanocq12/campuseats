# Semana 5: REST y formatos de intercambio

CampusEats acepta cuerpos JSON para sus operaciones de escritura. Los ejemplos muestran la misma representación del producto en distintos formatos.

## JSON (formato usado por la API)

```http
POST /api/productos
Content-Type: application/json
```

```json
{
  "nombre": "Empanada",
  "precio": 2000,
  "disponible": true
}
```

## XML (representación equivalente)

```xml
<producto>
  <nombre>Empanada</nombre>
  <precio>2000</precio>
  <disponible>true</disponible>
</producto>
```

El servidor de este proyecto no anuncia ni interpreta XML; para enviarlo habría que agregar un parser XML y validación específica, por lo que se mantiene JSON como formato de la API.

## Formulario URL-encoded

```http
POST /api/productos
Content-Type: application/x-www-form-urlencoded
```

```text
nombre=Empanada&precio=2000&disponible=true
```

Express necesitaría `express.urlencoded()` y reglas que conviertan los valores de texto a tipos apropiados. La API acepta JSON deliberadamente para que las validaciones de números y booleanos sean explícitas.

## Multipart form-data

`multipart/form-data` permite enviar texto y archivos en una misma solicitud. Se usa al incorporar fotos de productos; este proyecto aún no tiene subida de imágenes, así que el tipo de contenido no se habilita prematuramente.

Las rutas REST del taller usan sustantivos plurales y verbos HTTP: `GET /api/productos`, `POST /api/productos`, `PUT /api/productos/:id`, `PATCH /api/productos/:id/stock` y `DELETE /api/productos/:id`.
