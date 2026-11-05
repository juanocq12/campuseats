import * as servicio from '../services/productos.service.js';
import { precioEnDolares } from '../services/tasas.service.js';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

export async function listar(req, res, next) {
  try {
    res.json(await servicio.listar({
      disponibles: req.query.disponibles === undefined ? undefined : req.query.disponibles === 'true',
      buscar: typeof req.query.buscar === 'string' ? req.query.buscar : undefined,
    }));
  } catch (error) { next(error); }
}

export async function obtener(req, res, next) {
  try {
    res.json(await servicio.buscarPorId(Number(req.params.id)));
  } catch (error) { next(error); }
}

export async function precioUsd(req, res, next) {
  try {
    const producto = await servicio.buscarPorId(Number(req.params.id));
    const precio = await precioEnDolares(producto.precio);
    res.json({ id: producto.id, nombre: producto.nombre, ...precio });
  } catch (error) {
    next(error);
  }
}

export async function subirFoto(req, res, next) {
  if (!req.file) return res.status(400).json({ error: 'Adjunta un archivo en el campo "imagen"' });

  try {
    const imagenUrl = `/imagenes/productos/${req.file.filename}`;
    const producto = await servicio.cambiarImagen(Number(req.params.id), imagenUrl);
    res.json(producto);
  } catch (error) {
    await unlink(path.resolve('uploads/productos', req.file.filename)).catch(() => {});
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    res.status(201).json(await servicio.crear(req.body));
  } catch (error) { next(error); }
}

export async function actualizar(req, res, next) {
  try {
    res.json(await servicio.actualizar(Number(req.params.id), req.body));
  } catch (error) { next(error); }
}

export async function ajustarStock(req, res, next) {
  try {
    res.json(await servicio.ajustarStock(Number(req.params.id), req.body.delta));
  } catch (error) { next(error); }
}

export async function eliminar(req, res, next) {
  try {
    await servicio.eliminar(Number(req.params.id));
    res.status(204).end();
  } catch (error) { next(error); }
}
