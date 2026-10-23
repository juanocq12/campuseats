import * as servicio from '../services/pedidos.service.js';

export async function crear(req, res, next) {
  try {
    const pedido = await servicio.crearPedido(req.usuario.id, req.body.items ?? []);
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
}

export async function listar(req, res, next) {
  try {
    const resultado = await servicio.listarPedidos({
      usuarioId: req.usuario.id,
      rol: req.usuario.rol,
      estado: req.query.estado,
      pagina: Number(req.query.pagina ?? 1),
      limite: Number(req.query.limite ?? 10),
      filtrarUsuarioId: req.query.usuarioId ? Number(req.query.usuarioId) : undefined,
    });
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    res.json(await servicio.buscarPedido(Number(req.params.id), req.usuario));
  } catch (error) {
    next(error);
  }
}

export async function cambiarEstado(req, res, next) {
  try {
    res.json(await servicio.cambiarEstadoPedido(Number(req.params.id), req.body.estado));
  } catch (error) {
    next(error);
  }
}
