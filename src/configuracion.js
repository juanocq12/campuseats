import 'dotenv/config';

export function obtenerJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe configurarse con al menos 32 caracteres');
  }
  return secret;
}
