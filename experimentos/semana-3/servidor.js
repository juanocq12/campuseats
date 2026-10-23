import http from 'node:http';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const productosIniciales = [
  { id: 1, nombre: 'Almuerzo del día', precio: 12000, stock: 25 },
  { id: 2, nombre: 'Jugo natural', precio: 4000, stock: 50 },
  { id: 3, nombre: 'Café campesino', precio: 2500, stock: 100 },
];

export function crearServidor({ productos = structuredClone(productosIniciales) } = {}) {
  let siguienteId = Math.max(0, ...productos.map((producto) => producto.id)) + 1;

  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const ruta = url.pathname.match(/^\/api\/productos(?:\/([^/]+))?$/);

    function responder(statusCode, datos) {
      res.writeHead(statusCode, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      });
      res.end(datos === undefined ? undefined : JSON.stringify(datos));
    }

    if (!ruta) return responder(404, { error: 'Ruta no encontrada' });
    if (req.method === 'GET' && ruta[1] === undefined) {
      const disponibles = url.searchParams.get('disponibles') === 'true';
      const listado = disponibles ? productos.filter((producto) => producto.stock > 0) : productos;
      return responder(200, listado);
    }

    const id = ruta[1] === undefined ? undefined : Number(ruta[1]);
    if (ruta[1] !== undefined && (!Number.isSafeInteger(id) || id < 1)) {
      return responder(400, { error: 'El id debe ser un entero positivo' });
    }

    if (req.method === 'GET') {
      const producto = productos.find((item) => item.id === id);
      return producto ? responder(200, producto) : responder(404, { error: 'Producto no encontrado' });
    }

    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
      res.setHeader('allow', 'GET, POST, PUT, DELETE');
      return responder(405, { error: 'Método no permitido' });
    }

    if (req.method === 'DELETE') {
      if (id === undefined) return responder(400, { error: 'Se requiere el id del producto' });
      const indice = productos.findIndex((item) => item.id === id);
      if (indice === -1) return responder(404, { error: 'Producto no encontrado' });
      productos.splice(indice, 1);
      return responder(204);
    }

    let body;
    try {
      body = await leerJson(req);
    } catch (error) {
      return responder(error.statusCode ?? 400, { error: error.message });
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return responder(400, { error: 'El cuerpo debe ser un objeto JSON' });
    }

    const errorValidacion = validarProducto(body);
    if (errorValidacion) return responder(400, { error: errorValidacion });

    const duplicado = productos.find(
      (item) => item.nombre.toLocaleLowerCase() === body.nombre.trim().toLocaleLowerCase() && item.id !== id
    );
    if (duplicado) return responder(409, { error: 'Ya existe un producto con ese nombre' });

    if (req.method === 'POST') {
      if (id !== undefined) return responder(404, { error: 'Ruta no encontrada' });
      const nuevo = {
        id: siguienteId++,
        nombre: body.nombre.trim(),
        precio: body.precio,
        stock: body.stock ?? 0,
      };
      productos.push(nuevo);
      return responder(201, nuevo);
    }

    if (id === undefined) return responder(404, { error: 'Ruta no encontrada' });
    const producto = productos.find((item) => item.id === id);
    if (!producto) return responder(404, { error: 'Producto no encontrado' });
    producto.nombre = body.nombre.trim();
    producto.precio = body.precio;
    producto.stock = body.stock ?? producto.stock;
    return responder(200, producto);
  });
}

function validarProducto(body) {
  if (typeof body.nombre !== 'string' || body.nombre.trim().length === 0 || body.nombre.trim().length > 80) {
    return 'nombre debe contener entre 1 y 80 caracteres';
  }
  if (!Number.isSafeInteger(body.precio) || body.precio < 0) {
    return 'precio debe ser un entero no negativo';
  }
  if (body.stock !== undefined && (!Number.isSafeInteger(body.stock) || body.stock < 0)) {
    return 'stock debe ser un entero no negativo';
  }
  return undefined;
}

async function leerJson(req) {
  const partes = [];
  let bytes = 0;
  for await (const parte of req) {
    bytes += parte.length;
    if (bytes > 1024 * 1024) {
      const error = new Error('El cuerpo de la solicitud es demasiado grande');
      error.statusCode = 413;
      throw error;
    }
    partes.push(parte);
  }

  if (bytes === 0) return null;
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8'));
  } catch {
    throw new Error('JSON inválido');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const puerto = Number(process.env.PORT ?? 3001);
  const servidor = crearServidor();
  servidor.listen(puerto, () => {
    console.log(`API nativa de práctica en http://localhost:${puerto}`);
  });
}
