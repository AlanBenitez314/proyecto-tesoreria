import { api } from './api';

export interface ProyeccionParams {
  year: number;
  incluir_deuda?: boolean;
  detalle?: 'none' | 'por_tipo' | 'por_miembro';
}

export async function getProyeccion(params: ProyeccionParams) {
  // Backend real: GET /api/proyeccion/?year=YYYY&incluir_deuda=true|false&detalle=...
  const res = await api.get('/proyeccion/', {
    params: {
      year: params.year,
      incluir_deuda: params.incluir_deuda ? 'true' : 'false',
      detalle: params.detalle,
    },
  });
  return res.data;
}
