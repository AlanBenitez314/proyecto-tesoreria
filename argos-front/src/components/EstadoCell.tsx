// EstadoCell.tsx
import { useState } from 'react';
import { marcarEstado } from '../services/estados';
import { MenuItem, Select, CircularProgress } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

type Props = {
  miembroId: number;
  anio: number;
  mes: number; // 1..12
  value: 'pagada' | 'debe' | 'exento';
  onChangeLocal?: (next: 'pagada' | 'debe' | 'exento') => void;
};

export default function EstadoCell({ miembroId, anio, mes, value, onChangeLocal }: Props) {
  const [val, setVal] = useState(value);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: SelectChangeEvent) {
    const next = e.target.value as 'pagada' | 'debe' | 'exento';
    setVal(next);
    onChangeLocal?.(next);
    setLoading(true);
    try {
      await marcarEstado({ miembro_id: miembroId, anio, mes, estado: next });
    } catch (err) {
      console.error(err);
      setVal(value);
      onChangeLocal?.(value);
    } finally {
      setLoading(false);
    }
  }

  const bg =
    val === 'pagada' ? 'success.light' :
    val === 'debe'   ? 'error.light'   :
                       'grey.200';

  return (
    <>
      <Select
        size="small"
        value={val}
        onChange={handleChange}
        disabled={loading}
        sx={{
          minWidth: 120,
          '& .MuiSelect-select': {
            bgcolor: bg,
            // opcional: un poco de “pill”
            borderRadius: 1,
            textAlign: 'center',
            py: 0.5,
          },
        }}
      >
        <MenuItem value="pagada">Pagada</MenuItem>
        <MenuItem value="debe">Debe</MenuItem>
        <MenuItem value="exento">Exento</MenuItem>
      </Select>
      {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
    </>
  );
}
