import { api } from './api';

export async function pagarCapitas(input: {
  miembro_id: number;
  anio: number;
  mes_inicio: number;   // 1..12
  cantidad: number;     // N capitas
  fecha_pago?: string;  // YYYY-MM-DD
  comentario?: string;
}) {
  const r = await api.post('/capitas/pagar/', input);
  return r.data as {
    ok: boolean;
    miembro_id: number;
    meses_pagados: number[];
    monto: number;
  };
}
