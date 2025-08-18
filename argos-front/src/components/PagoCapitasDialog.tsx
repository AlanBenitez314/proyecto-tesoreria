import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Autocomplete
} from '@mui/material';
import { pagarCapitas } from '../services/pagos';
import { getMiembros } from '../services/miembros';
import type { Miembro } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  preset?: { miembro_id?: number; anio?: number; mes_inicio?: number }; // para precargar
  onSuccess?: () => void; // refrescar tablas/listas
};

export default function PagoCapitasDialog({ open, onClose, preset, onSuccess }: Props) {
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [miembro, setMiembro] = useState<Miembro | null>(null);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [mesInicio, setMesInicio] = useState<number>(new Date().getMonth()+1);
  const [cantidad, setCantidad] = useState<number>(1);
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().slice(0,10));
  const [comentario, setComentario] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const data = await getMiembros()
      setMiembros(data);
      if (preset?.miembro_id) {
        const found = data.find(x => x.id === preset.miembro_id) || null;
        setMiembro(found);
      } else {
        setMiembro(null);
      }
      setAnio(preset?.anio ?? new Date().getFullYear());
      setMesInicio(preset?.mes_inicio ?? (new Date().getMonth()+1));
      setCantidad(1);
      setComentario('');
      setFechaPago(new Date().toISOString().slice(0,10));
    })();
  }, [open, preset]);

  async function handleSubmit() {
    if (!miembro) return;
    if (mesInicio < 1 || mesInicio > 12) return;
    if (cantidad < 1) return;

    setSaving(true);
    try {
      await pagarCapitas({
        miembro_id: miembro.id,
        anio, mes_inicio: mesInicio, cantidad,
        fecha_pago: fechaPago, comentario
      });
      onSuccess?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar pago de capitas</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={miembros}
            getOptionLabel={(o)=>o.nombre}
            value={miembro}
            onChange={(_,v)=>setMiembro(v)}
            renderInput={(params)=> <TextField {...params} label="Miembro" />}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Año" type="number" value={anio}
              onChange={e=>setAnio(Number(e.target.value))} sx={{ flex:1 }}
            />
            <TextField
              label="Mes inicio" type="number" value={mesInicio}
              onChange={e=>setMesInicio(Number(e.target.value))}
              inputProps={{ min:1, max:12 }} sx={{ flex:1 }}
            />
            <TextField
              label="Cantidad" type="number" value={cantidad}
              onChange={e=>setCantidad(Number(e.target.value))}
              inputProps={{ min:1 }} sx={{ flex:1 }}
            />
          </Stack>
          <TextField
            label="Fecha de pago" type="date"
            value={fechaPago} onChange={e=>setFechaPago(e.target.value)}
            InputLabelProps={{ shrink:true }}
          />
          <TextField
            label="Comentario" value={comentario}
            onChange={e=>setComentario(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>Registrar</Button>
      </DialogActions>
    </Dialog>
  );
}
