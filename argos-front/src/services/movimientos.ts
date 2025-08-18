import { api } from './api';

export type Movimiento = {
  id: number;
  tipo: 'INGRESO' | 'EGRESO';
  fecha: string; // YYYY-MM-DD
  monto: number | string;
  miembro: number | null;
  categoria: string;
  comentario: string;
};

export async function listarMovimientos(params?: {
  desde?: string; hasta?: string; tipo?: 'INGRESO'|'EGRESO'; categoria?: string; miembro?: number;
}) {
  // El ViewSet soporta filtros por query? Si no, filtramos del lado del front luego de traer.
  const r = await api.get('/movimientos/', { params });
  return r.data as Movimiento[];
}

export async function crearMovimiento(input: Omit<Movimiento,'id'>) {
  const r = await api.post('/movimientos/', input);
  return r.data as Movimiento;
}
