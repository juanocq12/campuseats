import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { io as crearClienteSocket } from 'socket.io-client';
import {
  configurarTiempoReal,
  emitirEstadoPedido,
  emitirPedidoCreado,
} from '../src/tiempo-real.js';

test('autentica conexiones y limita eventos a las salas del usuario y del rol', async () => {
  const secreto = 'secreto-de-pruebas-de-32-caracteres-minimo';
  process.env.JWT_SECRET = secreto;
  const servidorHttp = createServer();
  const io = configurarTiempoReal(servidorHttp);
  await new Promise((resolve) => servidorHttp.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${servidorHttp.address().port}`;
  const clientes = [];

  function conectar(id, rol) {
    const token = jwt.sign({ rol }, secreto, { subject: String(id), algorithm: 'HS256' });
    const cliente = crearClienteSocket(url, {
      auth: { token },
      autoConnect: false,
      reconnection: false,
    });
    clientes.push(cliente);
    return new Promise((resolve, reject) => {
      cliente.once('connect', () => resolve(cliente));
      cliente.once('connect_error', reject);
      cliente.connect();
    });
  }

  try {
    const [ana, beto, admin] = await Promise.all([
      conectar(10, 'CLIENTE'),
      conectar(20, 'CLIENTE'),
      conectar(1, 'ADMIN'),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 20));
    const pedido = {
      id: 45,
      estado: 'PREPARANDO',
      total: 12000,
      creadoEn: '2026-11-05T12:00:00.000Z',
      usuario: { id: 10, nombre: 'Ana' },
      items: [{ cantidad: 1, producto: { id: 5, nombre: 'Arepa' } }],
    };

    const eventoAna = new Promise((resolve) => ana.once('pedido:estado', resolve));
    const eventoAdmin = new Promise((resolve) => admin.once('pedido:actualizado', resolve));
    let eventosBeto = 0;
    beto.on('pedido:estado', () => { eventosBeto += 1; });
    emitirEstadoPedido(pedido);

    assert.deepEqual(await eventoAna, {
      id: 45,
      estado: 'PREPARANDO',
      creadoEn: '2026-11-05T12:00:00.000Z',
    });
    assert.equal((await eventoAdmin).id, 45);

    const pedidoCreado = new Promise((resolve) => admin.once('pedido:creado', resolve));
    let pedidosCreadosParaBeto = 0;
    beto.on('pedido:creado', () => { pedidosCreadosParaBeto += 1; });
    emitirPedidoCreado(pedido);
    const datosPedido = await pedidoCreado;
    assert.deepEqual(datosPedido.usuario, { id: 10, nombre: 'Ana' });
    assert.equal('email' in datosPedido.usuario, false);

    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(eventosBeto, 0);
    assert.equal(pedidosCreadosParaBeto, 0);

    const invalido = crearClienteSocket(url, {
      auth: { token: 'token-invalido' },
      autoConnect: false,
      reconnection: false,
    });
    clientes.push(invalido);
    const errorConexion = new Promise((resolve) => invalido.once('connect_error', resolve));
    invalido.connect();
    assert.match((await errorConexion).message, /Token inválido/);
  } finally {
    for (const cliente of clientes) cliente.disconnect();
    await new Promise((resolve) => io.close(resolve));
  }
});
