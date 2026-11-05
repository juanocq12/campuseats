export async function enviarSmsSimulado(telefono, mensaje) {
  console.log('┌──────────────── SMS SIMULADO ────────────────');
  console.log(`│ Para: ${telefono}`);
  console.log(`│ Mensaje: ${mensaje}`);
  console.log('└──────────────────────────────────────────────');
  return { ok: true, id: `sim-${Date.now()}`, proveedor: 'simulado' };
}
