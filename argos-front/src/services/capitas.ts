// src/services/capitas.ts
import { api } from './api';

export async function pagarCapitas(input: {
  miembro_id: number;
  anio: number;
  mes_inicio: number;
  cantidad: number;
  fecha_pago?: string;
  comentario?: string;
}) {
  const r = await api.post('/capitas/pagar/', input);
  return r.data as { ok: boolean; meses_pagados: number[]; monto: number };
}
