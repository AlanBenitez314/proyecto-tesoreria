// src/pages/Miembros.tsx
import { useEffect, useState } from 'react';
import { getMiembros, createMiembro, updateMiembro, deleteMiembro } from '../services/miembros';
import type { Miembro } from '../types';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Button,
  Stack, Typography, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MiembroDialog from '../components/MiembroDialog';

export default function MiembrosPage() {
  const [rows, setRows] = useState<Miembro[]>([]);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<Miembro | null>(null);

  async function load() {
    const data = await getMiembros();
    setRows(data);
  }

  useEffect(() => { load(); }, []);

  async function onCreate(data: any) {
    const r = await createMiembro(data);
    setRows(prev => [r, ...prev]);
  }

  async function onUpdate(data: any) {
    if (!editRow) return;
    const r = await updateMiembro(editRow.id, data);
    setRows(prev => prev.map(x => x.id === r.id ? r : x));
  }

  async function onDelete(id: number) {
    if (!confirm('¿Eliminar miembro?')) return;
    await deleteMiembro(id);
    setRows(prev => prev.filter(x => x.id !== id));
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h6">Miembros</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditRow(null); setOpen(true); }}
        >
          Nuevo
        </Button>
      </Stack>

      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Grado</TableCell>
              <TableCell>Tipo cápita</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.nombre}</TableCell>
                <TableCell>{r.grado}</TableCell>
                <TableCell>{r.tipo_capita}</TableCell>
                <TableCell>{r.activo ? 'Sí' : 'No'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => { setEditRow(r); setOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => onDelete(r.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={5}>Sin miembros</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <MiembroDialog
        open={open}
        onClose={() => setOpen(false)}
        initial={editRow ?? undefined}
        onSubmit={editRow ? onUpdate : onCreate}
      />
    </Stack>
  );
}
