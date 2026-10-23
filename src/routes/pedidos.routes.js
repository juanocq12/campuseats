import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/pedidos.controller.js';
import { autenticar, requerirRol } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglasPedido = [
  body('items').isArray({ min: 1 }).withMessage('items debe ser un arreglo con al menos un producto'),
  body('items.*.productoId').isInt({ min: 1, max: 2147483647 }).withMessage('Cada producto debe tener un productoId válido'),
  body('items.*.cantidad').isInt({ min: 1, max: 2147483647 }).withMessage('Cada producto debe tener una cantidad entera mayor a cero'),
];

const reglaId = param('id').isInt({ min: 1, max: 2147483647 }).withMessage('El id debe ser un entero positivo');
const reglasListado = [
  query('estado').optional().isIn(['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'])
    .withMessage('Estado de pedido inválido'),
  query('pagina').optional().isInt({ min: 1, max: 21474836 }).withMessage('pagina debe ser un entero positivo'),
  query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('limite debe estar entre 1 y 100'),
  query('usuarioId').optional().isInt({ min: 1, max: 2147483647 }).withMessage('usuarioId debe ser un entero positivo'),
];

router.get('/', autenticar, reglasListado, validar, controlador.listar);
router.get('/:id', autenticar, reglaId, validar, controlador.obtener);
router.post('/', autenticar, reglasPedido, validar, controlador.crear);
router.patch(
  '/:id/estado',
  autenticar,
  requerirRol('ADMIN'),
  reglaId,
  body('estado').isIn(['RECIBIDO', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'])
    .withMessage('Estado de pedido inválido'),
  validar,
  controlador.cambiarEstado
);

export default router;
