import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controlador from '../controllers/usuarios.controller.js';
import { autenticar, requerirRol } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const soloAdmin = [autenticar, requerirRol('ADMIN')];
const reglaId = param('id').isInt({ min: 1, max: 2147483647 })
  .withMessage('El id debe ser un entero positivo');

router.get('/', ...soloAdmin, controlador.listar);
router.get('/:id', ...soloAdmin, reglaId, validar, controlador.obtener);
router.post(
  '/',
  ...soloAdmin,
  body('nombre')
    .isString().withMessage('El nombre es obligatorio')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .bail()
    .trim()
    .toLowerCase(),
  body('password')
    .isString().withMessage('La contraseña es obligatoria')
    .bail()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('La contraseña no puede superar 72 bytes'),
  validar,
  controlador.crear
);

export default router;
