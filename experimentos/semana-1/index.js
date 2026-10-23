import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const API_USUARIOS = 'https://jsonplaceholder.typicode.com/users';
const esMainModule = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

export function saludar(nombre) {
  const nombreLimpio = nombre?.trim();
  return `Hola, ${nombreLimpio || 'estudiante'}.`;
}

export async function consultarUsuario(id, fetchFn = fetch) {
  if (!/^[1-9]\d*$/.test(String(id))) {
    throw new Error('El ID debe ser un entero positivo');
  }

  const respuesta = await fetchFn(`${API_USUARIOS}/${id}`);
  if (respuesta.status === 404) return null;
  if (!respuesta.ok) {
    throw new Error(`La API respondió con HTTP ${respuesta.status}`);
  }

  return respuesta.json();
}

async function main(argumentos) {
  const [argumento] = argumentos;
  if (!argumento) {
    console.log(saludar('estudiante'));
    return;
  }

  if (/^[1-9]\d*$/.test(argumento)) {
    const usuario = await consultarUsuario(argumento);
    if (!usuario) {
      console.log('Usuario no encontrado');
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ id: usuario.id, nombre: usuario.name, email: usuario.email }, null, 2));
    return;
  }

  console.log(saludar(argumento));
}

if (esMainModule) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
