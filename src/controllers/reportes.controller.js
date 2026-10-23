import * as servicio from '../services/pedidos.service.js';

export async function ventasDia(req, res, next) {
  try {
    const fecha = req.query.fecha ?? new Date().toISOString().slice(0, 10);
    res.json(await servicio.obtenerReporteVentasDia(fecha));
  } catch (error) {
    next(error);
  }
}
