// src/services/miembros.ts
import { api } from './api';
import type { Miembro } from '../types';

export async function getMiembros(): Promise<Miembro[]> {
  const r = await api.get<Miembro[]>('/miembros/');
  return r.data;
}

export async function createMiembro(payload: {
  nombre: string; grado?: string; tipo_capita?: string; activo?: boolean;
}): Promise<Miembro> {
  const r = await api.post<Miembro>('/miembros/', payload);
  return r.data;
}

export async function updateMiembro(id: number, payload: Partial<Miembro>): Promise<Miembro> {
  const r = await api.patch<Miembro>(`/miembros/${id}/`, payload);
  return r.data;
}

export async function deleteMiembro(id: number): Promise<void> {
  await api.delete(`/miembros/${id}/`);
}
