import { useEffect, useState } from 'react';
import { getMiembros } from '../services/miembros';
import type { Miembro } from '../types';

export default function MiembrosList() {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMiembros()
      .then(setMiembros)
      .catch((err) => {
        console.error(err);
        setError('No se pudo cargar la lista de miembros');
      });
  }, []);

  if (error) return <div style={{ color: 'crimson' }}>{error}</div>;

  return (
    <div>
      <h2>Miembros</h2>
      <ul>
        {miembros.map((m) => (
          <li key={m.id}>
            {m.nombre} — {m.tipo_capita}
          </li>
        ))}
      </ul>
    </div>
  );
}
