import bcrypt from 'bcrypt';
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

const camposPublicos = { id: true, nombre: true, email: true, rol: true, creadoEn: true };

export function listar() {
  return prisma.usuario.findMany({ select: camposPublicos, orderBy: { id: 'asc' } });
}

export async function buscarPorId(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: camposPublicos });
  if (!usuario) throw noEncontrado('Usuario no encontrado');
  return usuario;
}

export async function crear({ nombre, email, password }) {
  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) throw conflicto('Ya existe un usuario con ese email');
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    return await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol: 'CLIENTE' },
      select: camposPublicos,
    });
  } catch (error) {
    if (error.code === 'P2002') throw conflicto('Ya existe un usuario con ese email');
    throw error;
  }
}
