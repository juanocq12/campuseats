// Configura Express (sin arrancarlo)
import express from 'express';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import productosRouter from './routes/productos.routes.js';
import pedidosRouter from './routes/pedidos.routes.js';
import reportesRouter from './routes/reportes.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';
import { manejadorErrores } from './middlewares/errores.js';
import { fileURLToPath } from 'node:url';
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use('/imagenes/productos', express.static(fileURLToPath(new URL('../uploads/productos/', import.meta.url))));
app.use(express.static(fileURLToPath(new URL('../public/', import.meta.url))));

app.get('/', (req, res) => res.json({ nombre: 'CampusEats API', version: '1.0' }));
app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/reportes', reportesRouter);

// 404 para todo lo demás
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// El manejador de errores siempre va de último
app.use(manejadorErrores);

export default app;
