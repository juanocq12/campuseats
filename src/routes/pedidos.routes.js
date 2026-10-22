import { Router } from 'express';
import { body } from 'express-validator';
import * as controlador from '../controllers/pedidos.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglasPedido = [
  body('usuarioId').isInt({ min: 1 }).withMessage('usuarioId debe ser un entero positivo'),
  body('items').isArray({ min: 1 }).withMessage('items debe ser un arreglo con al menos un producto'),
  body('items.*.productoId').isInt({ min: 1 }).withMessage('Cada producto debe tener un productoId válido'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('Cada producto debe tener una cantidad entera mayor a cero'),
];

router.post('/', reglasPedido, validar, controlador.crear);

export default router;
