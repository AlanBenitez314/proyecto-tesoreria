import { api } from './api';

export async function getSaldo(hasta?: string) {
  // GET /api/tesoreria/saldo/?hasta=YYYY-MM-DD (opcional)
  const res = await api.get('/tesoreria/saldo/', { params: { hasta } });
  return res.data as { hasta: string; ingresos: number; egresos: number; saldo: number };
}

export async function getResumenMensual(year: number) {
  // GET /api/tesoreria/resumen-mensual/?year=YYYY
  const res = await api.get('/tesoreria/resumen-mensual/', { params: { year } });
  return res.data as { year: number; meses: Array<{ mes: number; ingresos: number; egresos: number; neto: number }> };
}
