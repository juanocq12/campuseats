import * as servicio from '../services/auth.service.js';

export async function registrar(req, res, next) {
  try {
    res.status(201).json(await servicio.registrar(req.body));
  } catch (error) {
    next(error);
  }
}

export async function iniciarSesion(req, res, next) {
  try {
    res.json(await servicio.iniciarSesion(req.body));
  } catch (error) {
    next(error);
  }
}

export async function perfil(req, res, next) {
  try {
    const usuario = await servicio.buscarPerfil(req.usuario.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}
