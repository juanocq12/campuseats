import { enviarSmsSimulado } from './sms.simulado.js';
import { enviarSmsTwilio } from './sms.twilio.js';

export function enviarSms(telefono, mensaje) {
  const proveedor = process.env.SMS_PROVEEDOR === 'twilio'
    ? enviarSmsTwilio
    : enviarSmsSimulado;
  return proveedor(telefono, mensaje);
}
