import * as servicio from '../services/productos.service.js';

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
