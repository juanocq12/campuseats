import { Router } from 'express';
import { query } from 'express-validator';
import * as controlador from '../controllers/reportes.controller.js';
import { autenticar, requerirRol } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

router.get(
  '/ventas-dia',
  autenticar,
  requerirRol('ADMIN'),
  query('fecha')
    .optional()
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('fecha debe tener el formato AAAA-MM-DD'),
  validar,
  controlador.ventasDia
);

export default router;
