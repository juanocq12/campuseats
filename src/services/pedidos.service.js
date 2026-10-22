import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

export async function crearPedido(usuarioId, items) {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw noEncontrado(`Usuario ${usuarioId} no existe`);

    let total = 0;
    const itemsParaCrear = [];

    for (const item of items) {
      const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
      if (!producto) throw noEncontrado(`Producto ${item.productoId} no existe`);
      if (producto.stock < item.cantidad) {
        throw conflicto(`Stock insuficiente de "${producto.nombre}": hay ${producto.stock} y se piden ${item.cantidad}`);
      }

      await tx.producto.update({
        where: { id: producto.id },
        data: { stock: { decrement: item.cantidad } },
      });

      total += producto.precio * item.cantidad;
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
      include: {
        items: true,
      },
    });
  });
}
