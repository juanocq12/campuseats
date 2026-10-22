import { prisma } from '../src/db.js';

async function main() {
  await prisma.usuario.upsert({
    where: { email: 'admin@campuseats.co' },
    update: {},
    create: {
      nombre: 'Admin Cafetería',
      email: 'admin@campuseats.co',
      passwordHash: 'TODO-semana-8',
      rol: 'ADMIN',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'ana@ucaldas.edu.co' },
    update: {},
    create: {
      nombre: 'Ana Estudiante',
      email: 'ana@ucaldas.edu.co',
      passwordHash: 'TODO-semana-8',
      rol: 'CLIENTE',
    },
  });

  const productos = [
    {
      nombre: 'Almuerzo del día',
      precio: 12000,
      stock: 25,
      categoria: 'Almuerzos',
      descripcion: 'Menú del día',
    },
    {
      nombre: 'Jugo natural',
      precio: 4000,
      stock: 50,
      categoria: 'Bebidas',
      descripcion: 'Jugo recién preparado',
    },
    {
      nombre: 'Café campesino',
      precio: 2500,
      stock: 100,
      categoria: 'Bebidas',
      descripcion: 'Café de la casa',
    },
    {
      nombre: 'Empanada',
      precio: 2000,
      stock: 40,
      categoria: 'Snacks',
      descripcion: 'Empanada casera',
    },
    {
      nombre: 'Sandwich de pollo',
      precio: 9500,
      stock: 15,
      categoria: 'Almuerzos',
      descripcion: 'Sandwich con pollo',
    },
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { nombre: producto.nombre },
      update: {
        precio: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
      },
      create: producto,
    });
  }

  console.log('Seed completado: 2 usuarios y 5 productos');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
