// Mapa de URLs + reglas de validación de formato
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/productos.controller.js';
import { autenticar, requerirRol } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglaId = param('id').isInt({ min: 1, max: 2147483647 }).withMessage('El id debe ser un entero positivo');

const reglasProducto = [
  body('nombre')
    .isString().withMessage('El nombre es obligatorio')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 80 }).withMessage('Máximo 80 caracteres'),
  body('precio').isInt({ min: 0, max: 2147483647 }).withMessage('El precio debe ser un entero no negativo válido'),
  body('stock').optional().isInt({ min: 0, max: 2147483647 }).withMessage('El stock debe ser un entero no negativo válido'),
  body('categoria').optional().isString().bail().trim().notEmpty().isLength({ max: 50 })
    .withMessage('La categoría debe tener entre 1 y 50 caracteres'),
  body('descripcion').optional({ values: 'null' }).isString().bail().isLength({ max: 500 })
    .withMessage('La descripción no puede superar 500 caracteres'),
  body('disponible').optional().isBoolean().withMessage('disponible debe ser booleano'),
];

router.get(
  '/',
  query('disponibles').optional().isIn(['true', 'false']).withMessage('disponibles debe ser true o false'),
  query('buscar').optional().isString().bail().trim().isLength({ max: 80 }).withMessage('buscar no puede superar 80 caracteres'),
  validar,
  controlador.listar
);
router.get('/:id', reglaId, validar, controlador.obtener);
router.post('/', autenticar, requerirRol('ADMIN'), reglasProducto, validar, controlador.crear);
router.put('/:id', autenticar, requerirRol('ADMIN'), reglaId, reglasProducto, validar, controlador.actualizar);
router.patch(
  '/:id/stock',
  autenticar,
  requerirRol('ADMIN'),
  reglaId,
  body('delta').isInt({ min: -2147483647, max: 2147483647 }).withMessage('delta debe ser un entero válido'),
  validar,
  controlador.ajustarStock
);
router.delete('/:id', autenticar, requerirRol('ADMIN'), reglaId, validar, controlador.eliminar);

export default router;
