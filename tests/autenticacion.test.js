import assert from 'node:assert/strict';
import { test } from 'node:test';
import jwt from 'jsonwebtoken';
import { autenticar, requerirRol } from '../src/middlewares/autenticacion.js';

const secret = 'secreto-de-prueba-para-jwt-de-al-menos-32-caracteres';
process.env.JWT_SECRET = secret;

function ejecutar(middleware, autorizacion) {
  const resultado = { error: undefined, siguiente: false };
  const req = { get: () => autorizacion, usuario: undefined };
  const res = {};
  middleware(req, res, (error) => {
    resultado.error = error;
    resultado.siguiente = true;
  });
  return { ...resultado, usuario: req.usuario };
}

test('rechaza solicitudes sin token', () => {
  const resultado = ejecutar(autenticar);
  assert.equal(resultado.error?.codigo, 401);
  assert.equal(resultado.siguiente, true);
});

test('valida JWT y asigna la identidad al request', () => {
  const token = jwt.sign({ rol: 'CLIENTE' }, secret, { subject: '7', expiresIn: '1h' });
  const resultado = ejecutar(autenticar, `Bearer ${token}`);

  assert.equal(resultado.error, undefined);
  assert.deepEqual(resultado.usuario, { id: 7, rol: 'CLIENTE' });
});

test('rechaza JWT expirados', () => {
  const token = jwt.sign({ rol: 'CLIENTE' }, secret, { subject: '7', expiresIn: -1 });
  const resultado = ejecutar(autenticar, `Bearer ${token}`);

  assert.equal(resultado.error?.codigo, 401);
});

test('permite la ruta cuando el rol está autorizado', () => {
  const resultado = ejecutar((req, res, next) => {
    req.usuario = { id: 1, rol: 'ADMIN' };
    requerirRol('ADMIN')(req, res, next);
  });

  assert.equal(resultado.error, undefined);
  assert.equal(resultado.siguiente, true);
});

test('deniega la ruta cuando el rol no está autorizado', () => {
  const resultado = ejecutar((req, res, next) => {
    req.usuario = { id: 7, rol: 'CLIENTE' };
    requerirRol('ADMIN')(req, res, next);
  });

  assert.equal(resultado.error?.codigo, 403);
});
