import { prisma } from '../db.js';
import { conflicto, datosInvalidos, noEncontrado } from '../errores.js';
import { esTransicionPedidoValida } from './pedidos.transitions.js';

const estadosPedido = ['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'];

const seleccionPedido = {
  id: true,
  estado: true,
  total: true,
  creadoEn: true,
  usuario: { select: { id: true, nombre: true, email: true, rol: true } },
  items: {
    select: {
      id: true,
      cantidad: true,
      precioUnitario: true,
      producto: { select: { id: true, nombre: true, categoria: true } },
    },
  },
};

export async function crearPedido(usuarioId, items) {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw noEncontrado(`Usuario ${usuarioId} no existe`);

    let total = 0;
    const itemsParaCrear = [];

    for (const item of items) {
      const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
      if (!producto) throw noEncontrado(`Producto ${item.productoId} no existe`);
      if (!producto.disponible) {
        throw conflicto(`El producto "${producto.nombre}" no está disponible`);
      }

      const inventario = await tx.producto.updateMany({
        where: { id: producto.id, disponible: true, stock: { gte: item.cantidad } },
        data: { stock: { decrement: item.cantidad } },
      });
      if (inventario.count === 0) {
        const actualizado = await tx.producto.findUnique({ where: { id: producto.id } });
        if (!actualizado) throw noEncontrado(`Producto ${item.productoId} no existe`);
        throw conflicto(
          `Stock insuficiente de "${producto.nombre}": hay ${actualizado.stock} y se piden ${item.cantidad}`
        );
      }

      total += producto.precio * item.cantidad;
      if (!Number.isSafeInteger(total) || total > 2147483647) {
        throw datosInvalidos('El total del pedido supera el valor máximo permitido');
      }

      itemsParaCrear.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
      });
    }

    return tx.pedido.create({
      data: {
        usuarioId,
        total,
        items: { create: itemsParaCrear },
      },
      select: seleccionPedido,
    });
  }, { maxWait: 10000, timeout: 15000 });
}

export async function listarPedidos({
  usuarioId,
  rol,
  estado,
  pagina = 1,
  limite = 10,
  filtrarUsuarioId,
}) {
  const where = {
    ...(rol === 'ADMIN'
      ? (filtrarUsuarioId ? { usuarioId: filtrarUsuarioId } : {})
      : { usuarioId }),
    ...(estado ? { estado } : {}),
  };
  const [datos, total] = await prisma.$transaction([
    prisma.pedido.findMany({
      where,
      select: seleccionPedido,
      orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.pedido.count({ where }),
  ]);

  return {
    datos,
    paginacion: {
      pagina,
      limite,
      total,
      paginas: Math.ceil(total / limite),
    },
  };
}

export async function buscarPedido(id, usuario) {
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    select: seleccionPedido,
  });
  if (!pedido) throw noEncontrado('Pedido no encontrado');
  if (usuario.rol !== 'ADMIN' && pedido.usuario.id !== usuario.id) {
    throw noEncontrado('Pedido no encontrado');
  }
  return pedido;
}

export async function cambiarEstadoPedido(id, siguiente) {
  if (!estadosPedido.includes(siguiente)) {
    throw datosInvalidos('Estado de pedido inválido');
  }

  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.findUnique({
      where: { id },
      select: { id: true, estado: true, items: { select: { productoId: true, cantidad: true } } },
    });
    if (!pedido) throw noEncontrado('Pedido no encontrado');
    if (!esTransicionPedidoValida(pedido.estado, siguiente)) {
      throw conflicto(`No se puede cambiar un pedido de ${pedido.estado} a ${siguiente}`);
    }

    const cambio = await tx.pedido.updateMany({
      where: { id, estado: pedido.estado },
      data: { estado: siguiente },
    });
    if (cambio.count === 0) throw conflicto('El pedido cambió mientras se procesaba la solicitud');

    if (siguiente === 'CANCELADO') {
      for (const item of pedido.items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        });
      }
    }

    return tx.pedido.findUnique({ where: { id }, select: seleccionPedido });
  });
}

export async function obtenerReporteVentasDia(fecha) {
  const inicio = new Date(`${fecha}T00:00:00.000Z`);
  if (Number.isNaN(inicio.getTime()) || inicio.toISOString().slice(0, 10) !== fecha) {
    throw datosInvalidos('La fecha debe tener el formato AAAA-MM-DD');
  }
  const fin = new Date(inicio);
  fin.setUTCDate(fin.getUTCDate() + 1);
  const where = {
    estado: { not: 'CANCELADO' },
    creadoEn: { gte: inicio, lt: fin },
  };

  return prisma.$transaction(async (tx) => {
    const resumen = await tx.pedido.aggregate({
      where,
      _count: { _all: true },
      _sum: { total: true },
    });
    const unidadesAgrupadas = await tx.pedidoItem.groupBy({
      by: ['productoId'],
      where: { pedido: where },
      _sum: { cantidad: true },
      orderBy: { productoId: 'asc' },
    });
    const productos = await tx.producto.findMany({
      where: { id: { in: unidadesAgrupadas.map(({ productoId }) => productoId) } },
      select: { id: true, nombre: true },
    });
    const nombresPorId = new Map(productos.map(({ id, nombre }) => [id, nombre]));
    const unidadesPorProducto = unidadesAgrupadas.map(({ productoId, _sum }) => {
      const nombre = nombresPorId.get(productoId);
      if (!nombre) throw new Error(`No se encontró el producto ${productoId} del reporte`);
      return { productoId, nombre, unidades: _sum.cantidad ?? 0 };
    });

    return {
      fecha,
      totalVendido: resumen._sum.total ?? 0,
      pedidos: resumen._count._all,
      unidadesPorProducto,
    };
  });
}
