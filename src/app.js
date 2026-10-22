// Configura Express (sin arrancarlo)
import express from 'express';
import morgan from 'morgan';
import productosRouter from './routes/productos.routes.js';
import pedidosRouter from './routes/pedidos.routes.js';
import { manejadorErrores } from './middlewares/errores.js';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => res.json({ nombre: 'CampusEats API', version: '1.0' }));
app.use('/api/productos', productosRouter);
app.use('/api/pedidos', pedidosRouter);

// 404 para todo lo demás
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// El manejador de errores siempre va de último
app.use(manejadorErrores);

export default app;
