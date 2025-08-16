// src/components/MiembroDialog.tsx
import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Stack
} from '@mui/material';

type MiembroForm = {
  nombre: string;
  grado: string;
  tipo_capita: 'Común'|'Social';
  activo: boolean;
};

export default function MiembroDialog({
  open, onClose, onSubmit, initial
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MiembroForm) => Promise<void>|void;
  initial?: Partial<MiembroForm>;
}) {
  const [form, setForm] = useState<MiembroForm>({
    nombre: '', grado: 'M', tipo_capita: 'Común', activo: true,
  });

  useEffect(() => {
    setForm(prev => ({ ...prev, ...initial }));
  }, [initial]);

  const handle = (k: keyof MiembroForm) => (e: any) => {
    const v = k === 'activo' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [k]: v }));
  };

  async function submit() {
    await onSubmit(form);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial?.nombre ? 'Editar miembro' : 'Nuevo miembro'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nombre" value={form.nombre} onChange={handle('nombre')} autoFocus />
          <TextField label="Grado" value={form.grado} onChange={handle('grado')} />
          <FormControl>
            <InputLabel>Tipo de cápita</InputLabel>
            <Select label="Tipo de cápita" value={form.tipo_capita} onChange={handle('tipo_capita')}>
              <MenuItem value="Común">Común</MenuItem>
              <MenuItem value="Social">Social</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Switch checked={form.activo} onChange={handle('activo')} />}
            label="Activo"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
