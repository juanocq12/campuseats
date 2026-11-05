import multer from 'multer';
import crypto from 'node:crypto';
import { ErrorHttp } from '../errores.js';

const extensionesPorMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const almacenamiento = multer.diskStorage({
  destination: 'uploads/productos',
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${extensionesPorMime[file.mimetype]}`);
  },
});

export const subirImagen = multer({
  storage: almacenamiento,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!extensionesPorMime[file.mimetype]) {
      return callback(new ErrorHttp(415, 'Solo se permiten imágenes JPG, PNG o WebP'));
    }
    callback(null, true);
  },
});
