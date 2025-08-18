export type Variant = 'info' | 'tripulante' | 'camara';

export function detectVariant(): Variant {
  const qp = new URLSearchParams(window.location.search);
  const v = qp.get('variant');
  if (v === 'info' || v === 'tripulante' || v === 'camara') return v;

  const h = window.location.hostname;
  if (h.startsWith('info.')) return 'info';
  if (h.startsWith('tripulante.')) return 'tripulante';
  if (h.startsWith('camara.')) return 'camara';
  return 'info';
}