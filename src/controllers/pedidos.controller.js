import * as servicio from '../services/pedidos.service.js';

export async function crear(req, res, next) {
  try {
    const pedido = await servicio.crearPedido(req.usuario.id, req.body.items ?? []);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
}
