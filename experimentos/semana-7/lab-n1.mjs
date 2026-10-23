import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.ts';

if (!process.env.DATABASE_URL) {
  throw new Error('Configura DATABASE_URL antes de ejecutar este laboratorio.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter,
  log: [{ emit: 'event', level: 'query' }],
});

let consultas = 0;
prisma.$on('query', () => {
  consultas += 1;
});

try {
  consultas = 0;
  const pedidos = await prisma.pedido.findMany({
    select: { id: true },
    orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }],
    take: 5,
  });

  if (pedidos.length === 0) {
    console.log('No hay pedidos de prueba; agrega datos de desarrollo antes de comparar los patrones.');
    console.log('No se escribieron ni modificaron registros.');
  } else {
    for (const pedido of pedidos) {
      await prisma.pedidoItem.findMany({
        where: { pedidoId: pedido.id },
        select: {
          id: true,
          cantidad: true,
          producto: { select: { id: true, nombre: true } },
        },
      });
    }
    const consultasN1 = consultas;

    consultas = 0;
    await prisma.pedido.findMany({
      select: {
        id: true,
        items: {
          select: {
            id: true,
            cantidad: true,
            producto: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }],
      take: 5,
    });
    const consultasRelacionadas = consultas;

    console.log(`Pedidos revisados: ${pedidos.length} (máximo 5)`);
    console.log(`Consultas con patrón N+1: ${consultasN1}`);
    console.log(`Consultas con relación en Prisma: ${consultasRelacionadas}`);
    console.log('Laboratorio de solo lectura: no crea, modifica ni elimina registros.');
  }
} finally {
  await prisma.$disconnect();
}
