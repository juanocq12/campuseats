import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { crearServidor } from '../experimentos/semana-3/servidor.js';

test('API HTTP nativa implementa CRUD, filtros y validación de negocio', async () => {
  const servidor = crearServidor();
  servidor.listen(0);
  await once(servidor, 'listening');
  const baseUrl = `http://127.0.0.1:${servidor.address().port}`;

  try {
    const listado = await fetch(`${baseUrl}/api/productos`);
    assert.equal(listado.status, 200);
    assert.equal((await listado.json()).length, 3);

    const disponibles = await fetch(`${baseUrl}/api/productos?disponibles=true`);
    assert.equal((await disponibles.json()).length, 3);

    const creado = await fetch(`${baseUrl}/api/productos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Galleta', precio: 1200, stock: 4 }),
    });
    assert.equal(creado.status, 201);
    const producto = await creado.json();

    const repetido = await fetch(`${baseUrl}/api/productos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: ' galleta ', precio: 1300 }),
    });
    assert.equal(repetido.status, 409);

    const precioNegativo = await fetch(`${baseUrl}/api/productos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Precio inválido', precio: -1 }),
    });
    assert.equal(precioNegativo.status, 400);

    const actualizado = await fetch(`${baseUrl}/api/productos/${producto.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre: 'Galleta integral', precio: 1500, stock: 3 }),
    });
    assert.equal(actualizado.status, 200);
    assert.equal((await actualizado.json()).nombre, 'Galleta integral');

    const eliminado = await fetch(`${baseUrl}/api/productos/${producto.id}`, { method: 'DELETE' });
    assert.equal(eliminado.status, 204);

    const ausente = await fetch(`${baseUrl}/api/productos/${producto.id}`);
    assert.equal(ausente.status, 404);
  } finally {
    servidor.close();
    await once(servidor, 'close');
  }
});

test('API nativa distingue JSON inválido y rutas no encontradas', async () => {
  const servidor = crearServidor();
  servidor.listen(0);
  await once(servidor, 'listening');
  const baseUrl = `http://127.0.0.1:${servidor.address().port}`;

  try {
    const invalido = await fetch(`${baseUrl}/api/productos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{',
    });
    assert.equal(invalido.status, 400);

    const noExiste = await fetch(`${baseUrl}/ruta-ausente`);
    assert.equal(noExiste.status, 404);
  } finally {
    servidor.close();
    await once(servidor, 'close');
  }
});
