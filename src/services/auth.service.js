import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { obtenerJwtSecret } from '../configuracion.js';
import { conflicto, noAutorizado } from '../errores.js';

const camposPublicos = { id: true, nombre: true, email: true, rol: true, creadoEn: true };

export async function registrar({ nombre, email, password }) {
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

export async function iniciarSesion({ email, password }) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !(await bcrypt.compare(password, usuario.passwordHash))) {
    throw noAutorizado('Email o contraseña incorrectos');
  }

  const token = jwt.sign(
    { rol: usuario.rol },
    obtenerJwtSecret(),
    { subject: String(usuario.id), expiresIn: '2h', algorithm: 'HS256' }
  );

  return {
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      creadoEn: usuario.creadoEn,
    },
    token,
  };
}

export function buscarPerfil(id) {
  return prisma.usuario.findUnique({
    where: { id },
    select: camposPublicos,
  });
}
