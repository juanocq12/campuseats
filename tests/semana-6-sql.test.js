import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const puedeConectarDb = Boolean(process.env.DATABASE_URL);

test('taller SQL de semana 6: preparación y nueve consultas sobre un esquema temporal', {
  skip: !puedeConectarDb && 'Configura DATABASE_URL para ejecutar las pruebas SQL con PostgreSQL',
  timeout: 30000,
}, async () => {
  const [{ prisma }] = await Promise.all([import('../src/db.js')]);
  const esquema = `practica_test_${randomUUID().replaceAll('-', '')}`;
  const prefijoEsquema = 'campuseats_practica';
  const [preparacion, soluciones] = await Promise.all([
    readFile(new URL('../talleres/semana-6/preparar.sql', import.meta.url), 'utf8'),
    readFile(new URL('../talleres/semana-6/soluciones.sql', import.meta.url), 'utf8'),
  ]);

  try {
    await prisma.$transaction(async (tx) => {
      for (const sentencia of preparacion.split(';').map((item) => item.trim()).filter(Boolean)) {
        await tx.$executeRawUnsafe(sentencia.replaceAll(prefijoEsquema, esquema));
      }

      const consultas = [...soluciones.matchAll(/-- Reto (\d+)[^\r\n]*\r?\n([\s\S]*?;)/g)];
      assert.equal(consultas.length, 9);
      const resultados = [];
      for (const [, , consulta] of consultas) {
        resultados.push(await tx.$queryRawUnsafe(consulta.replaceAll(prefijoEsquema, esquema)));
      }

      assert.equal(resultados[0].length, 10);
      assert.equal(resultados[1].length, 2);
      assert.equal(resultados[2].length, 3);
      assert.equal(resultados[3].length, 5);
      assert.equal(Number(resultados[4][0].total_productos), 10);
      assert.equal(resultados[5].length, 4);
      assert.equal(resultados[6].length, 4);
      assert.equal(resultados[7][0].stock, 39);
      assert.ok(resultados[8].some(({ definicion }) => definicion.includes('CHECK')));
      assert.ok(resultados[8].some(({ definicion }) => definicion.includes('UNIQUE')));

      await tx.$executeRawUnsafe(`DROP SCHEMA "${esquema}" CASCADE`);
    });
  } finally {
    await prisma.$disconnect();
  }
});
