// Errores del dominio con código HTTP incorporado
export class ErrorHttp extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

export const noEncontrado = (m = 'Recurso no encontrado') => new ErrorHttp(404, m);
export const conflicto = (m = 'Conflicto con el estado actual') => new ErrorHttp(409, m);
export const datosInvalidos = (m = 'Datos inválidos') => new ErrorHttp(400, m);
export const noAutorizado = (m = 'Credenciales inválidas') => new ErrorHttp(401, m);
export const prohibido = (m = 'No tienes permiso para realizar esta acción') => new ErrorHttp(403, m);
