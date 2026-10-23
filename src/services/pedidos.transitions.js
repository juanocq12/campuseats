const transicionesPermitidas = {
  RECIBIDO: ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['LISTO', 'CANCELADO'],
  LISTO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export function esTransicionPedidoValida(actual, siguiente) {
  return transicionesPermitidas[actual]?.includes(siguiente) ?? false;
}
