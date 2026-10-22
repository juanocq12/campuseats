import 'dotenv/config';
import app from './app.js';
import { obtenerJwtSecret } from './configuracion.js';

const PUERTO = process.env.PORT ?? 3000;
obtenerJwtSecret();
app.listen(PUERTO, () => {
  console.log(`CampusEats API en http://localhost:${PUERTO}`);
});
