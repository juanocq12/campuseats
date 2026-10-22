// Mapa de URLs + reglas de validación de formato
import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controlador from '../controllers/productos.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglaId = param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo');

const reglasProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 80 }).withMessage('Máximo 80 caracteres'),
  body('precio').isInt({ min: 0 }).withMessage('El precio debe ser un entero >= 0'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero >= 0'),
];

router.get('/', controlador.listar);
router.get('/:id', reglaId, validar, controlador.obtener);
router.post('/', reglasProducto, validar, controlador.crear);
router.put('/:id', reglaId, reglasProducto, validar, controlador.actualizar);
router.patch(
  '/:id/stock',
  reglaId,
  body('delta').isInt().withMessage('delta debe ser un entero'),
  validar,
  controlador.ajustarStock
);
router.delete('/:id', reglaId, validar, controlador.eliminar);

export default router;
