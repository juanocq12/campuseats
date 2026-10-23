import assert from 'node:assert/strict';
import { test } from 'node:test';
import { consultarUsuario, saludar } from '../experimentos/semana-1/index.js';

test('saluda con el nombre recibido y usa un valor predeterminado', () => {
  assert.equal(saludar('Juan'), 'Hola, Juan.');
  assert.equal(saludar('  '), 'Hola, estudiante.');
});

test('consulta el usuario y no interpreta un 404 como JSON', async () => {
  let consultado;
  const usuario = await consultarUsuario(7, async (url) => {
    consultado = url;
    return { status: 200, ok: true, json: async () => ({ id: 7, name: 'Juan' }) };
  });
  assert.equal(consultado, 'https://jsonplaceholder.typicode.com/users/7');
  assert.equal(usuario.name, 'Juan');

  const ausente = await consultarUsuario(999, async () => ({
    status: 404,
    ok: false,
    json: async () => { throw new Error('No debe intentar parsear JSON en un 404'); },
  }));
  assert.equal(ausente, null);
});

test('rechaza IDs inválidos y propaga los errores HTTP inesperados', async () => {
  await assert.rejects(() => consultarUsuario(0), /entero positivo/);
  await assert.rejects(
    () => consultarUsuario(1, async () => ({ status: 503, ok: false })),
    /HTTP 503/
  );
});
