// src/services/suscripciones.ts
import { api } from './api';

export type Suscripcion = {
  id: number;
  tipo_capita: 'Común' | 'Social';
  precio_por_capita: string | number; // backend devuelve string decimal
  vigente_desde: string;              // YYYY-MM-DD
};

export type SuscripcionInput = {
  tipo_capita: 'Común' | 'Social';
  precio_por_capita: string | number;
  vigente_desde: string; // YYYY-MM-DD
};

export async function listarSuscripciones() {
  const r = await api.get('/suscripciones/');
  return r.data as Suscripcion[];
}

export async function crearSuscripcion(input: SuscripcionInput) {
  const r = await api.post('/suscripciones/', input);
  return r.data as Suscripcion;
}

export async function actualizarSuscripcion(id: number, input: Partial<SuscripcionInput>) {
  const r = await api.patch(`/suscripciones/${id}/`, input);
  return r.data as Suscripcion;
}

export async function eliminarSuscripcion(id: number) {
  await api.delete(`/suscripciones/${id}/`);
}
