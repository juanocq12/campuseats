import * as servicio from '../services/usuarios.service.js';

export async function listar(req, res, next) {
  try {
    res.json(await servicio.listar());
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json(await servicio.buscarPorId(Number(req.params.id)));
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    res.status(201).json(await servicio.crear(req.body));
  } catch (error) {
    next(error);
  }
}
