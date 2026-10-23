import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

const puedeConectarDb = Boolean(
  process.env.DATABASE_URL && process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
);

test('flujo CampusEats con PostgreSQL: auth, pedidos, permisos, concurrencia y rollback', {
  skip: !puedeConectarDb && 'Configura DATABASE_URL y JWT_SECRET para ejecutar la integración',
  timeout: 120000,
}, async () => {
  const [{ default: app }, { prisma }, bcrypt] = await Promise.all([
    import('../src/app.js'),
    import('../src/db.js'),
    import('bcrypt'),
  ]);
  const sufijo = randomUUID();
  const password = `Integration-${randomUUID()}-Pass`;
  const emails = [
    `cliente-${sufijo}@example.test`,
    `admin-${sufijo}@example.test`,
    `otro-${sufijo}@example.test`,
    `registro-${sufijo}@example.test`,
  ];
  const usuarioIds = [];
  const productoIds = [];
  let server;

  async function peticion(ruta, { method = 'GET', token, body } = {}) {
    const respuesta = await fetch(`http://127.0.0.1:${server.address().port}${ruta}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const texto = await respuesta.text();
    return { status: respuesta.status, data: texto ? JSON.parse(texto) : undefined };
  }

  async function tokenDe(email, rol) {
    const resultado = await peticion('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    assert.equal(resultado.status, 200);
    assert.equal(resultado.data.usuario.rol, rol);
    assert.equal('passwordHash' in resultado.data.usuario, false);
    return resultado.data.token;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    for (const [nombre, email, rol] of [
      ['Cliente de integración', emails[0], 'CLIENTE'],
      ['Administrador de integración', emails[1], 'ADMIN'],
      ['Otro cliente de integración', emails[2], 'CLIENTE'],
    ]) {
      const usuario = await prisma.usuario.create({
        data: { nombre, email, passwordHash, rol },
        select: { id: true },
      });
      usuarioIds.push(usuario.id);
    }

    const productoPrincipal = await prisma.producto.create({
      data: {
        nombre: `Prueba de concurrencia ${sufijo}`,
        precio: 100,
        stock: 10,
        categoria: 'Pruebas',
      },
      select: { id: true },
    });
    const productoSecundario = await prisma.producto.create({
      data: {
        nombre: `Prueba de rollback ${sufijo}`,
        precio: 200,
        stock: 1,
        categoria: 'Pruebas',
      },
      select: { id: true },
    });
    productoIds.push(productoPrincipal.id, productoSecundario.id);

    server = app.listen(0);
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });

    const registro = await peticion('/api/auth/register', {
      method: 'POST',
      body: { nombre: 'Registro de integración', email: emails[3], password, rol: 'ADMIN' },
    });
    assert.equal(registro.status, 201);
    usuarioIds.push(registro.data.id);
    assert.equal(registro.data.rol, 'CLIENTE');
    assert.equal('passwordHash' in registro.data, false);
    const duplicado = await peticion('/api/auth/register', {
      method: 'POST',
      body: { nombre: 'Registro repetido', email: emails[3], password },
    });
    assert.equal(duplicado.status, 409);
    const noToken = await peticion('/api/pedidos', { method: 'POST', body: { items: [] } });
    assert.equal(noToken.status, 401);

    const [clientToken, adminToken, otroToken] = await Promise.all([
      tokenDe(emails[0], 'CLIENTE'),
      tokenDe(emails[1], 'ADMIN'),
      tokenDe(emails[2], 'CLIENTE'),
    ]);

    const prohibido = await peticion('/api/productos', {
      method: 'POST',
      token: clientToken,
      body: { nombre: 'No autorizado', precio: 100, stock: 1 },
    });
    assert.equal(prohibido.status, 403);

    const productoAdministrado = await peticion('/api/productos', {
      method: 'POST',
      token: adminToken,
      body: {
        nombre: `Producto API ${sufijo}`,
        precio: 500,
        stock: 4,
        categoria: 'Pruebas',
        descripcion: 'Producto para probar CRUD',
        disponible: true,
      },
    });
    assert.equal(productoAdministrado.status, 201);
    const productoAdminId = productoAdministrado.data.id;
    productoIds.push(productoAdminId);
    const productoDuplicado = await peticion('/api/productos', {
      method: 'POST',
      token: adminToken,
      body: {
        nombre: productoAdministrado.data.nombre,
        precio: 500,
        stock: 1,
      },
    });
    assert.equal(productoDuplicado.status, 409);
    assert.equal((await peticion(`/api/productos/${productoAdminId}`)).status, 200);
    const actualizado = await peticion(`/api/productos/${productoAdminId}`, {
      method: 'PUT',
      token: adminToken,
      body: {
        nombre: `Producto API actualizado ${sufijo}`,
        precio: 600,
        stock: 4,
        categoria: 'Pruebas',
        descripcion: 'Descripción actualizada',
        disponible: true,
      },
    });
    assert.equal(actualizado.status, 200);
    assert.equal(actualizado.data.precio, 600);
    assert.equal((await peticion(`/api/productos/${productoAdminId}/stock`, {
      method: 'PATCH',
      token: adminToken,
      body: { delta: 1 },
    })).status, 200);
    assert.equal((await peticion(`/api/productos?disponibles=true&buscar=${encodeURIComponent(`Producto API actualizado ${sufijo}`)}`)).status, 200);
    assert.equal((await peticion(`/api/productos/${productoAdminId}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 204);

    const ventasConcurrentes = await Promise.all(
      Array.from({ length: 20 }, () => peticion('/api/pedidos', {
        method: 'POST',
        token: clientToken,
        body: { items: [{ productoId: productoPrincipal.id, cantidad: 1 }] },
      }))
    );
    const creadas = ventasConcurrentes.filter(({ status }) => status === 201);
    const conflictos = ventasConcurrentes.filter(({ status }) => status === 409);
    assert.equal(creadas.length, 10);
    assert.equal(conflictos.length, 10);
    assert.equal(ventasConcurrentes.filter(({ status }) => status !== 201 && status !== 409).length, 0);
    assert.equal((await prisma.producto.findUnique({ where: { id: productoPrincipal.id } })).stock, 0);
    const productoConPedidos = await peticion(`/api/productos/${productoPrincipal.id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert.equal(productoConPedidos.status, 409);

    const lista = await peticion('/api/pedidos?pagina=1&limite=2', { token: clientToken });
    assert.equal(lista.status, 200);
    assert.equal(lista.data.datos.length, 2);
    assert.equal(lista.data.paginacion.total, 10);
    assert.equal('passwordHash' in lista.data.datos[0].usuario, false);

    const pedidoPropio = creadas[0].data;
    const accesoAjeno = await peticion(`/api/pedidos/${pedidoPropio.id}`, { token: otroToken });
    assert.equal(accesoAjeno.status, 404);

    const cambioCliente = await peticion(`/api/pedidos/${pedidoPropio.id}/estado`, {
      method: 'PATCH',
      token: clientToken,
      body: { estado: 'PREPARANDO' },
    });
    assert.equal(cambioCliente.status, 403);

    for (const estado of ['PREPARANDO', 'LISTO', 'ENTREGADO']) {
      const cambio = await peticion(`/api/pedidos/${pedidoPropio.id}/estado`, {
        method: 'PATCH',
        token: adminToken,
        body: { estado },
      });
      assert.equal(cambio.status, 200);
      assert.equal(cambio.data.estado, estado);
    }

    const estadoTerminal = await peticion(`/api/pedidos/${pedidoPropio.id}/estado`, {
      method: 'PATCH',
      token: adminToken,
      body: { estado: 'CANCELADO' },
    });
    assert.equal(estadoTerminal.status, 409);

    const reporteComoCliente = await peticion('/api/reportes/ventas-dia', { token: clientToken });
    assert.equal(reporteComoCliente.status, 403);
    const reporte = await peticion('/api/reportes/ventas-dia', { token: adminToken });
    assert.equal(reporte.status, 200);
    assert.equal(reporte.data.pedidosEntregados, 1);
    assert.equal(reporte.data.ventasTotales, 100);

    const pedidoCancelado = creadas.find(({ data }) => data.id !== pedidoPropio.id);
    const cancelacion = await peticion(`/api/pedidos/${pedidoCancelado.data.id}/estado`, {
      method: 'PATCH',
      token: adminToken,
      body: { estado: 'CANCELADO' },
    });
    assert.equal(cancelacion.status, 200);
    assert.equal((await prisma.producto.findUnique({ where: { id: productoPrincipal.id } })).stock, 1);

    const rollback = await peticion('/api/pedidos', {
      method: 'POST',
      token: clientToken,
      body: {
        items: [
          { productoId: productoPrincipal.id, cantidad: 1 },
          { productoId: productoSecundario.id, cantidad: 2 },
        ],
      },
    });
    assert.equal(rollback.status, 409);
    assert.equal((await prisma.producto.findUnique({ where: { id: productoPrincipal.id } })).stock, 1);
    assert.equal((await prisma.producto.findUnique({ where: { id: productoSecundario.id } })).stock, 1);

    const carreraFinal = await Promise.all(
      Array.from({ length: 20 }, () => peticion('/api/pedidos', {
        method: 'POST',
        token: clientToken,
        body: { items: [{ productoId: productoPrincipal.id, cantidad: 1 }] },
      }))
    );
    assert.equal(carreraFinal.filter(({ status }) => status === 201).length, 1);
    assert.equal(carreraFinal.filter(({ status }) => status === 409).length, 19);
    assert.equal((await prisma.producto.findUnique({ where: { id: productoPrincipal.id } })).stock, 0);
  } finally {
    if (server?.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (usuarioIds.length > 0) {
      const pedidos = await prisma.pedido.findMany({
        where: { usuarioId: { in: usuarioIds } },
        select: { id: true },
      });
      const pedidoIds = pedidos.map(({ id }) => id);
      await prisma.$transaction(async (tx) => {
        if (pedidoIds.length > 0) {
          await tx.pedidoItem.deleteMany({ where: { pedidoId: { in: pedidoIds } } });
          await tx.pedido.deleteMany({ where: { id: { in: pedidoIds } } });
        }
        if (productoIds.length > 0) {
          await tx.producto.deleteMany({ where: { id: { in: productoIds } } });
        }
        await tx.usuario.deleteMany({ where: { id: { in: usuarioIds } } });
      });
    }
    await prisma.$disconnect();
  }
});
