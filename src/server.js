import 'dotenv/config';
import { createServer } from 'node:http';
import app from './app.js';
import { obtenerJwtSecret } from './configuracion.js';
import { configurarTiempoReal } from './tiempo-real.js';

const PUERTO = process.env.PORT ?? 3000;
obtenerJwtSecret();
const servidor = createServer(app);
configurarTiempoReal(servidor);
servidor.listen(PUERTO, () => {
  console.log(`CampusEats API en http://localhost:${PUERTO}`);
});
