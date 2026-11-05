// El middleware de errores (4 parámetros)
import { ErrorHttp } from '../errores.js';
import multer from 'multer';

export function manejadorErrores(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'El archivo supera el máximo de 2 MB' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: `Campo de archivo inesperado: "${err.field}". Se esperaba "imagen"` });
    }
    return res.status(400).json({ error: 'La solicitud de archivo no es válida' });
  }
  if (err instanceof ErrorHttp) {
    return res.status(err.codigo).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo JSON no es válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande' });
  }
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
