import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { obtenerJwtSecret } from './configuracion.js';

let io;

export function configurarTiempoReal(servidor) {
  io = new Server(servidor);
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string' || token.length === 0) {
      return next(new Error('Autenticación requerida'));
    }

    try {
      const payload = jwt.verify(token, obtenerJwtSecret(), { algorithms: ['HS256'] });
      const usuarioId = Number(payload.sub);
      if (!Number.isSafeInteger(usuarioId) || usuarioId < 1 || !['CLIENTE', 'ADMIN'].includes(payload.rol)) {
        return next(new Error('Token inválido'));
      }

      socket.data.usuario = { id: usuarioId, rol: payload.rol };
      return next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return next(new Error('Token inválido o expirado'));
      }
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    const { id, rol } = socket.data.usuario;
    socket.join(`usuario:${id}`);
    socket.join(`rol:${rol}`);
  });

  return io;
}

export function emitirPedidoCreado(pedido) {
  if (!io) return;
  io.to('rol:ADMIN').emit('pedido:creado', {
    id: pedido.id,
    estado: pedido.estado,
    total: pedido.total,
    creadoEn: pedido.creadoEn,
    usuario: { id: pedido.usuario.id, nombre: pedido.usuario.nombre },
    items: pedido.items.map((item) => ({
      cantidad: item.cantidad,
      producto: { id: item.producto.id, nombre: item.producto.nombre },
    })),
  });
}

export function emitirEstadoPedido(pedido) {
  if (!io) return;
  const evento = {
    id: pedido.id,
    estado: pedido.estado,
    creadoEn: pedido.creadoEn,
  };
  io.to(`usuario:${pedido.usuario.id}`).emit('pedido:estado', evento);
  io.to('rol:ADMIN').emit('pedido:actualizado', evento);
}
