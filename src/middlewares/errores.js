// El middleware de errores (4 parámetros)
import { ErrorHttp } from '../errores.js';

export function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorHttp) {
    return res.status(err.codigo).json({ error: err.message });
  }
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
