import jwt from 'jsonwebtoken';
import { obtenerJwtSecret } from '../configuracion.js';
import { noAutorizado, prohibido } from '../errores.js';

export function autenticar(req, res, next) {
  const autorizacion = req.get('authorization');
  const coincidencia = /^Bearer\s+(.+)$/i.exec(autorizacion ?? '');
  if (!coincidencia) return next(noAutorizado('Debes iniciar sesión para continuar'));

  try {
    const payload = jwt.verify(coincidencia[1], obtenerJwtSecret(), {
      algorithms: ['HS256'],
    });
    const usuarioId = Number(payload.sub);
    if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 || !['CLIENTE', 'ADMIN'].includes(payload.rol)) {
      return next(noAutorizado('Token inválido'));
    }

    req.usuario = { id: usuarioId, rol: payload.rol };
    return next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(noAutorizado('Token inválido o expirado'));
    }
    return next(error);
  }
}

export function requerirRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) return next(noAutorizado('Debes iniciar sesión para continuar'));
    if (!rolesPermitidos.includes(req.usuario.rol)) return next(prohibido());
    next();
  };
}
