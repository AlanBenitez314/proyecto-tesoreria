// src/components/SuscripcionFormDialog.tsx
import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Stack
} from '@mui/material';
import type { Suscripcion, SuscripcionInput } from '../services/suscripciones';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SuscripcionInput) => Promise<void>;
  initial?: Suscripcion | null; // si viene -> modo edición
};

const TIPO_OPCIONES: Array<'Común'|'Social'> = ['Común', 'Social'];

export default function SuscripcionFormDialog({ open, onClose, onSubmit, initial }: Props) {
  const [tipoCapita, setTipoCapita] = useState<'Común'|'Social'>('Común');
  const [precio, setPrecio] = useState<string>('');
  const [vigenteDesde, setVigenteDesde] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTipoCapita(initial.tipo_capita);
      setPrecio(String(initial.precio_por_capita ?? ''));
      setVigenteDesde(initial.vigente_desde ?? '');
    } else {
      setTipoCapita('Común');
      setPrecio('');
      // por defecto hoy en formato YYYY-MM-DD
      setVigenteDesde(new Date().toISOString().slice(0,10));
    }
  }, [initial, open]);

  async function handleSubmit() {
    // validación mínima
    if (!precio || Number.isNaN(Number(precio))) return;
    if (!vigenteDesde) return;

    setSaving(true);
    try {
      await onSubmit({
        tipo_capita: tipoCapita,
        precio_por_capita: precio,
        vigente_desde: vigenteDesde,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? 'Editar suscripción' : 'Nueva suscripción'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Tipo de capita"
            value={tipoCapita}
            onChange={e => setTipoCapita(e.target.value as 'Común'|'Social')}
            disabled={!!initial} // única por tipo, no permitir cambiar en edición
          >
            {TIPO_OPCIONES.map(op => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Precio por capita"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={precio}
            onChange={e => setPrecio(e.target.value)}
          />

          <TextField
            label="Vigente desde"
            type="date"
            value={vigenteDesde}
            onChange={e => setVigenteDesde(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {initial ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
