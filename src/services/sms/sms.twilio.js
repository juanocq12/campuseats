export async function enviarSmsTwilio(telefono, mensaje) {
  const cuenta = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const origen = process.env.TWILIO_FROM;
  if (!cuenta || !token || !origen) {
    throw new Error('Configura TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_FROM');
  }

  const respuesta = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${cuenta}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${cuenta}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: telefono, From: origen, Body: mensaje }),
      signal: AbortSignal.timeout(5000),
    }
  );

  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(`Twilio falló: ${datos.message || respuesta.statusText}`);
  return { ok: true, id: datos.sid, proveedor: 'twilio' };
}
