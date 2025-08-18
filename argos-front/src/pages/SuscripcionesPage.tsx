// src/pages/SuscripcionesPage.tsx
import { useEffect, useState } from 'react';
import {
  Stack, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Tooltip, Snackbar, Alert, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  listarSuscripciones,
  crearSuscripcion,
  actualizarSuscripcion,
  eliminarSuscripcion,
  type Suscripcion
} from '../services/suscripciones';
import SuscripcionFormDialog from '../components/SuscripcionFormDialog';

export default function SuscripcionesPage() {
  const [items, setItems] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<Suscripcion | null>(null);
  const [toast, setToast] = useState<{open:boolean; msg:string; sev:'success'|'error'}>({open:false, msg:'', sev:'success'});

  async function refresh() {
    setLoading(true);
    try {
      const data = await listarSuscripciones();
      // ordenar por tipo para consistencia
      setItems(data.sort((a,b) => a.tipo_capita.localeCompare(b.tipo_capita)));
    } catch (e:any) {
      setToast({open:true, msg:'Error al cargar suscripciones', sev:'error'});
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function handleOpenCreate() {
    setEditItem(null);
    setOpenForm(true);
  }

  function handleOpenEdit(item: Suscripcion) {
    setEditItem(item);
    setOpenForm(true);
  }

  async function handleCreate(data: {tipo_capita:'Común'|'Social'; precio_por_capita:string|number; vigente_desde:string}) {
    try {
      const created = await crearSuscripcion(data);
      setItems(prev => {
        const next = [...prev.filter(p => p.id !== created.id), created];
        return next.sort((a,b) => a.tipo_capita.localeCompare(b.tipo_capita));
      });
      setToast({open:true, msg:'Suscripción creada', sev:'success'});
    } catch (e:any) {
      setToast({open:true, msg:'No se pudo crear. Verificá que el tipo no exista duplicado.', sev:'error'});
      console.error(e);
    }
  }

  async function handleUpdate(data: Partial<{precio_por_capita:string|number; vigente_desde:string}>) {
    if (!editItem) return;
    try {
      const updated = await actualizarSuscripcion(editItem.id, data);
      setItems(prev => prev.map(x => x.id === updated.id ? updated : x));
      setToast({open:true, msg:'Suscripción actualizada', sev:'success'});
    } catch (e:any) {
      setToast({open:true, msg:'No se pudo actualizar', sev:'error'});
      console.error(e);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta suscripción?')) return;
    try {
      await eliminarSuscripcion(id);
      setItems(prev => prev.filter(x => x.id !== id));
      setToast({open:true, msg:'Suscripción eliminada', sev:'success'});
    } catch (e:any) {
      setToast({open:true, msg:'No se pudo eliminar', sev:'error'});
      console.error(e);
    }
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Capitas (Suscripciones)</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Nueva
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Tipo</TableCell>
            <TableCell>Precio por capita</TableCell>
            <TableCell>Vigente desde</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(row => (
            <TableRow key={row.id} hover>
              <TableCell>{row.tipo_capita}</TableCell>
              <TableCell>${row.precio_por_capita}</TableCell>
              <TableCell>{row.vigente_desde}</TableCell>
              <TableCell align="right">
                <Tooltip title="Editar">
                  <IconButton onClick={() => handleOpenEdit(row)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton onClick={() => handleDelete(row.id)} size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}

          {!loading && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>No hay suscripciones cargadas.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <SuscripcionFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editItem}
        onSubmit={async (data) => {
          if (editItem) {
            await handleUpdate({ precio_por_capita: data.precio_por_capita, vigente_desde: data.vigente_desde });
          } else {
            await handleCreate(data);
          }
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(s => ({...s, open:false}))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast(s => ({...s, open:false}))} severity={toast.sev} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
