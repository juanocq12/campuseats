const URL_TASAS = 'https://open.er-api.com/v6/latest/USD';

export async function precioEnDolares(precioCop) {
  try {
    const respuesta = await fetch(URL_TASAS, { signal: AbortSignal.timeout(3000) });
    if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`);

    const datos = await respuesta.json();
    const tasaCop = datos.rates?.COP;
    if (typeof tasaCop !== 'number' || !Number.isFinite(tasaCop) || tasaCop <= 0) {
      throw new Error('La respuesta no trae una tasa COP válida');
    }

    return {
      cop: precioCop,
      usd: Number((precioCop / tasaCop).toFixed(2)),
      tasa: tasaCop,
      fuente: 'open.er-api.com',
    };
  } catch (error) {
    console.error('API de tasas no disponible:', error.message);
    return { cop: precioCop, usd: null, tasa: null, fuente: 'no-disponible' };
  }
}
