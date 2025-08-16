import { api } from './api';

export async function getTablaEstados(year: number) {
  const res = await api.get('/tabla/', { params: { year } });
  return res.data as { year: number; rows: any[] };
}

export async function marcarEstado(input: {
  miembro_id: number;
  anio: number;
  mes: number; // 1..12
  estado: 'pagada' | 'debe' | 'exento';
}) {
  const r = await api.post('/marcar-estado/', input);
  return r.data as { ok: boolean; id: number };
}
