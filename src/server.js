import app from './app.js';

const PUERTO = process.env.PORT ?? 3000;
app.listen(PUERTO, () => {
  console.log(`CampusEats API en http://localhost:${PUERTO}`);
});
