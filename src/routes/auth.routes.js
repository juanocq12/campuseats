import { Router } from 'express';
import { body } from 'express-validator';
import * as controlador from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/autenticacion.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglasEmail = body('email')
  .isEmail().withMessage('Debe ser un email válido')
  .bail()
  .trim()
  .toLowerCase();

router.post(
  '/register',
  body('nombre')
    .isString().withMessage('El nombre es obligatorio')
    .bail()
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  reglasEmail,
  body('password')
    .isString().withMessage('La contraseña es obligatoria')
    .bail()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('La contraseña no puede superar 72 bytes'),
  validar,
  controlador.registrar
);

router.post(
  '/login',
  reglasEmail,
  body('password')
    .isString().withMessage('La contraseña es obligatoria')
    .bail()
    .notEmpty().withMessage('La contraseña es obligatoria')
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('La contraseña no puede superar 72 bytes'),
  validar,
  controlador.iniciarSesion
);

router.get('/me', autenticar, controlador.perfil);

export default router;
