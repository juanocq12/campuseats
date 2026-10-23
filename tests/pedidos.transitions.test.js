import assert from 'node:assert/strict';
import { test } from 'node:test';
import { esTransicionPedidoValida } from '../src/services/pedidos.transitions.js';

test('permite las transiciones válidas del flujo del pedido', () => {
  assert.equal(esTransicionPedidoValida('RECIBIDO', 'PREPARANDO'), true);
  assert.equal(esTransicionPedidoValida('RECIBIDO', 'CANCELADO'), true);
  assert.equal(esTransicionPedidoValida('PREPARANDO', 'LISTO'), true);
  assert.equal(esTransicionPedidoValida('PREPARANDO', 'CANCELADO'), true);
  assert.equal(esTransicionPedidoValida('LISTO', 'ENTREGADO'), true);
});

test('rechaza transiciones inválidas y estados terminales', () => {
  assert.equal(esTransicionPedidoValida('RECIBIDO', 'ENTREGADO'), false);
  assert.equal(esTransicionPedidoValida('LISTO', 'CANCELADO'), false);
  assert.equal(esTransicionPedidoValida('ENTREGADO', 'PREPARANDO'), false);
  assert.equal(esTransicionPedidoValida('CANCELADO', 'RECIBIDO'), false);
  assert.equal(esTransicionPedidoValida('DESCONOCIDO', 'RECIBIDO'), false);
});
