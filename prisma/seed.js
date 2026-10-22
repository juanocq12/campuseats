import bcrypt from 'bcrypt';
import { prisma } from '../src/db.js';

async function main() {
  const passwordAdmin = process.env.SEED_ADMIN_PASSWORD;
  const passwordCliente = process.env.SEED_CLIENT_PASSWORD;
  if (!passwordAdmin || !passwordCliente) {
    throw new Error('Configura SEED_ADMIN_PASSWORD y SEED_CLIENT_PASSWORD antes de ejecutar el seed');
  }
  for (const [nombre, password] of [
    ['SEED_ADMIN_PASSWORD', passwordAdmin],
    ['SEED_CLIENT_PASSWORD', passwordCliente],
  ]) {
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new Error(`${nombre} debe tener entre 8 y 72 bytes`);
    }
  }

  const [hashAdmin, hashCliente] = await Promise.all([
    bcrypt.hash(passwordAdmin, 10),
    bcrypt.hash(passwordCliente, 10),
  ]);

  await prisma.usuario.upsert({
    where: { email: 'admin@campuseats.co' },
    update: { passwordHash: hashAdmin, rol: 'ADMIN' },
    create: {
      nombre: 'Admin Cafetería',
      email: 'admin@campuseats.co',
      passwordHash: hashAdmin,
      rol: 'ADMIN',
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'ana@ucaldas.edu.co' },
    update: { passwordHash: hashCliente, rol: 'CLIENTE' },
    create: {
      nombre: 'Ana Estudiante',
      email: 'ana@ucaldas.edu.co',
      passwordHash: hashCliente,
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
