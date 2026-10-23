import { prisma } from '../db.js';
import { noEncontrado, conflicto, datosInvalidos } from '../errores.js';

export async function listar({ disponibles, buscar } = {}) {
  return prisma.producto.findMany({
    where: {
      ...(disponibles === true ? { stock: { gt: 0 }, disponible: true } : {}),
      ...(disponibles === false ? { disponible: false } : {}),
      ...(buscar ? { nombre: { contains: buscar, mode: 'insensitive' } } : {}),
    },
    orderBy: { id: 'asc' },
  });
}

export async function buscarPorId(id) {
  const producto = await prisma.producto.findUnique({ where: { id } });
  if (!producto) throw noEncontrado('Producto no encontrado');
  return producto;
}

export async function crear({
  nombre,
  precio,
  stock = 0,
  categoria = 'General',
  descripcion,
  disponible = true,
}) {
  if (precio < 0) throw datosInvalidos('El precio no puede ser negativo');

  const existente = await prisma.producto.findUnique({ where: { nombre } });
  if (existente) {
    throw conflicto(`Ya existe un producto llamado "${nombre}"`);
  }

  try {
    return await prisma.producto.create({
      data: {
        nombre,
        precio,
        stock,
        categoria,
        descripcion,
        disponible,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') throw conflicto(`Ya existe un producto llamado "${nombre}"`);
    throw error;
  }
}

export async function actualizar(id, cambios) {
  await buscarPorId(id);

  if (cambios.precio !== undefined && cambios.precio < 0) {
    throw datosInvalidos('El precio no puede ser negativo');
  }

  if (cambios.nombre !== undefined) {
    const existente = await prisma.producto.findUnique({ where: { nombre: cambios.nombre } });
    if (existente && existente.id !== id) {
      throw conflicto(`Ya existe un producto llamado "${cambios.nombre}"`);
    }
  }

  const data = {};
  if (cambios.nombre !== undefined) data.nombre = cambios.nombre;
  if (cambios.precio !== undefined) data.precio = cambios.precio;
  if (cambios.stock !== undefined) data.stock = cambios.stock;
  if (cambios.categoria !== undefined) data.categoria = cambios.categoria;
  if (cambios.descripcion !== undefined) data.descripcion = cambios.descripcion;
  if (cambios.disponible !== undefined) data.disponible = cambios.disponible;

  try {
    return await prisma.producto.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (error.code === 'P2002') throw conflicto(`Ya existe un producto llamado "${cambios.nombre}"`);
    throw error;
  }
}

export async function ajustarStock(id, delta) {
  const { count } = await prisma.producto.updateMany({
    where: { id, stock: { gte: -delta } },
    data: { stock: { increment: delta } },
  });

  if (count === 0) {
    const producto = await buscarPorId(id);
    throw conflicto(`Stock insuficiente: hay ${producto.stock} y se piden ${-delta}`);
  }

  return buscarPorId(id);
}

export async function eliminar(id) {
  await buscarPorId(id);
  try {
    await prisma.producto.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw conflicto('No se puede eliminar un producto que ya aparece en pedidos');
    }
    throw error;
  }
}
