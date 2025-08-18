// src/services/tesoreria.ts
import { api } from './api';

export async function getSaldo(hasta?: string) {
  const res = await api.get('/tesoreria/saldo/', { params: { hasta } });
  return res.data as { hasta: string; ingresos: number; egresos: number; saldo: number };
}

export async function getResumenMensual(year: number) {
  const res = await api.get('/tesoreria/resumen-mensual/', { params: { year } });
  return res.data as { year: number; meses: Array<{ mes: number; ingresos: number; egresos: number; neto: number }> };
}

// NUEVO:
export type ProyeccionResponse = {
  year: number;
  total_esperado: number;
  total_proyectado: number;
  pagado_real: number;
  detalle_por_tipo?: Record<string, { esperado: number; proyectado: number }>;
  detalle_por_miembro?: any[];
};

export async function getProyeccion(params?: {
  year?: number;
  incluir_deuda?: boolean;
  detalle?: 'none'|'por_tipo'|'por_miembro';
}) {
  const res = await api.get('/proyeccion/', {
    params: {
      year: params?.year,
      incluir_deuda: params?.incluir_deuda,
      detalle: params?.detalle,
    },
  });
  return res.data as ProyeccionResponse;
}
