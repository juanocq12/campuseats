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

export async function crear({ nombre, email, password, rol }) {
  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) throw conflicto('Ya existe un usuario con ese email');
  return prisma.usuario.create({
    // TODO semana 8: passwordHash = await bcrypt.hash(password, 10)
    data: { nombre, email, passwordHash: password, rol },
    select: camposPublicos,
  });
}
