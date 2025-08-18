import { useEffect, useMemo, useState } from 'react';
import {
  Stack, Typography, TextField, MenuItem, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Box, Divider, Snackbar, Alert,
  Paper, Chip, Tabs, Tab, Switch, FormControlLabel
} from '@mui/material';
import { listarMovimientos, crearMovimiento, type Movimiento } from '../services/movimientos';
import { getMiembros } from '../services/miembros';
import type { Miembro } from '../types';
import PagoCapitasDialog from '../components/PagoCapitasDialog';
import { getSaldo, getProyeccion, type ProyeccionResponse } from '../services/tesoreria';

function useMoneyFormatter() {
  return useMemo(
    () => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }),
    []
  );
}

export default function MovimientosPage() {
  const fmt = useMoneyFormatter();
  const today = new Date().toISOString().slice(0,10);

  const [tab, setTab] = useState(0); // 0=Movimientos, 1=Proyección

  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipo, setTipo] = useState<'INGRESO'|'EGRESO'|''>('');
  const [categoria, setCategoria] = useState('');
  const [miembro, setMiembro] = useState<number|''>('');
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [miembrosById, setMiembrosById] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<{open:boolean; msg:string; sev:'success'|'error'}>({open:false, msg:'', sev:'success'});
  const [openPago, setOpenPago] = useState(false);

  const [saldo, setSaldo] = useState<{hasta:string; ingresos:number; egresos:number; saldo:number} | null>(null);

  // Proyección (pestaña 2)
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [incluirDeuda, setIncluirDeuda] = useState<boolean>(false);
  const [proj, setProj] = useState<ProyeccionResponse | null>(null);

  // Form crear movimiento general (no capitas)
  const [nuevo, setNuevo] = useState<Omit<Movimiento,'id'>>({
    tipo: 'EGRESO', fecha: today,
    monto: '', miembro: null, categoria: 'General', comentario: ''
  });

  async function refreshMovs() {
    try {
      const data = await listarMovimientos();
      setMovs(data);
    } catch (e) {
      console.error(e);
      setToast({open:true, msg:'Error al cargar movimientos', sev:'error'});
    }
  }

  async function refreshSaldo() {
    try {
      const data = await getSaldo(hasta || today);
      setSaldo(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function refreshMiembros() {
    const ms = await getMiembros();
    setMiembros(ms);
    const dict: Record<number,string> = {};
    for (const m of ms) dict[m.id] = m.nombre;
    setMiembrosById(dict);
  }

  useEffect(() => {
    refreshMovs();
    refreshMiembros();
  }, []);

  // actualizar saldo cuando cambia "hasta" o hay nuevos movimientos
  useEffect(() => {
    refreshSaldo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasta, movs.length]);

  // cargar proyección al entrar a la pestaña o al cambiar filtros
  useEffect(() => {
    if (tab !== 1) return;
    (async () => {
      try {
        const data = await getProyeccion({
          year,
          incluir_deuda: incluirDeuda,
          detalle: 'por_tipo',
        });
        setProj(data);
      } catch (e) {
        console.error(e);
        setProj(null);
      }
    })();
  }, [tab, year, incluirDeuda]);

  const filtrados = useMemo(() => {
    return movs.filter(m => {
      if (tipo && m.tipo !== tipo) return false;
      if (categoria && m.categoria !== categoria) return false;
      if (miembro && m.miembro !== miembro) return false;
      if (desde && m.fecha < desde) return false;
      if (hasta && m.fecha > hasta) return false;
      return true;
    }).sort((a,b) => (a.fecha < b.fecha ? 1 : -1));
  }, [movs, tipo, categoria, miembro, desde, hasta]);

  async function handleCrearMovimiento() {
    if (!nuevo.fecha || !nuevo.tipo || !nuevo.monto) return;
    try {
      const created = await crearMovimiento({
        tipo: nuevo.tipo,
        fecha: nuevo.fecha,
        monto: Number(nuevo.monto),
        miembro: nuevo.miembro ?? null,
        categoria: nuevo.categoria || 'General',
        comentario: nuevo.comentario || ''
      });
      setMovs(prev => [created, ...prev]);
      setToast({open:true, msg:'Movimiento creado', sev:'success'});
      setNuevo({ tipo: 'EGRESO', fecha: today, monto: '', miembro: null, categoria: 'General', comentario: '' });
    } catch (e) {
      console.error(e);
      setToast({open:true, msg:'No se pudo crear el movimiento', sev:'error'});
    }
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Tesorería</Typography>
        <Button variant="contained" onClick={()=>setOpenPago(true)}>Registrar pago de capitas</Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
        <Tab label="Movimientos" />
        <Tab label="Proyección" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          {/* Saldo actual */}
          {saldo && (
            <Paper variant="outlined" sx={{ p:2, display:'flex', gap:2, alignItems:'center', flexWrap:'wrap' }}>
              <Typography variant="subtitle2">Saldo al {saldo.hasta}</Typography>
              <Chip label={`Ingresos ${fmt.format(saldo.ingresos)}`} color="success" />
              <Chip label={`Egresos ${fmt.format(saldo.egresos)}`} color="error" />
              <Chip label={`Saldo ${fmt.format(saldo.saldo)}`} color={saldo.saldo >= 0 ? 'primary' : 'warning'} />
            </Paper>
          )}

          {/* Filtros */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="Desde" type="date" value={desde} onChange={e=>setDesde(e.target.value)} InputLabelProps={{shrink:true}} />
            <TextField label="Hasta" type="date" value={hasta} onChange={e=>setHasta(e.target.value)} InputLabelProps={{shrink:true}} />
            <TextField select label="Tipo" value={tipo} onChange={e=>setTipo(e.target.value as any)} sx={{minWidth:140}}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="INGRESO">INGRESO</MenuItem>
              <MenuItem value="EGRESO">EGRESO</MenuItem>
            </TextField>
            <TextField label="Categoría" value={categoria} onChange={e=>setCategoria(e.target.value)} />
            <TextField select label="Miembro" value={miembro} onChange={e=>setMiembro(e.target.value ? Number(e.target.value) : '')} sx={{minWidth:200}}>
              <MenuItem value="">Todos</MenuItem>
              {miembros.map(m => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
            </TextField>
            <Button onClick={refreshMovs}>Refrescar</Button>
          </Stack>

          <Divider />

          {/* Crear movimiento general */}
          <Stack spacing={2}>
            <Typography variant="subtitle1">Crear movimiento (general)</Typography>
            <Stack direction="row" spacing={2}>
              <TextField select label="Tipo" value={nuevo.tipo} onChange={e=>setNuevo(s=>({...s, tipo:e.target.value as 'INGRESO'|'EGRESO'}))} sx={{minWidth:140}}>
                <MenuItem value="INGRESO">INGRESO</MenuItem>
                <MenuItem value="EGRESO">EGRESO</MenuItem>
              </TextField>
              <TextField label="Fecha" type="date" value={nuevo.fecha} onChange={e=>setNuevo(s=>({...s, fecha:e.target.value}))} InputLabelProps={{shrink:true}} />
              <TextField label="Monto" type="number" value={String(nuevo.monto)} onChange={e=>setNuevo(s=>({...s, monto:e.target.value}))} />
              <TextField label="Categoría" value={nuevo.categoria} onChange={e=>setNuevo(s=>({...s, categoria:e.target.value}))} />
              <TextField select label="Miembro (opcional)" value={nuevo.miembro ?? ''} onChange={e=>setNuevo(s=>({...s, miembro: e.target.value ? Number(e.target.value) : null}))} sx={{minWidth:200}}>
                <MenuItem value="">—</MenuItem>
                {miembros.map(m => <MenuItem key={m.id} value={m.id}>{m.nombre}</MenuItem>)}
              </TextField>
              <TextField label="Comentario" value={nuevo.comentario} onChange={e=>setNuevo(s=>({...s, comentario:e.target.value}))} sx={{ minWidth: 240 }} />
              <Button variant="contained" onClick={handleCrearMovimiento}>Crear</Button>
            </Stack>
          </Stack>

          {/* Tabla */}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Miembro</TableCell>
                <TableCell>Comentario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell>{m.fecha}</TableCell>
                  <TableCell>{m.tipo}</TableCell>
                  <TableCell>{fmt.format(Number(m.monto))}</TableCell>
                  <TableCell>{m.categoria}</TableCell>
                  <TableCell>{m.miembro ? (miembrosById[m.miembro] || m.miembro) : '—'}</TableCell>
                  <TableCell>{m.comentario}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PagoCapitasDialog
            open={openPago}
            onClose={()=>setOpenPago(false)}
            onSuccess={refreshMovs}
          />
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1">Proyección de capitas</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Año" type="number" value={year}
              onChange={e=>setYear(Number(e.target.value))} sx={{ maxWidth: 140 }}
            />
            <FormControlLabel
              control={<Switch checked={incluirDeuda} onChange={e=>setIncluirDeuda(e.target.checked)} />}
              label="Incluir deuda"
            />
          </Stack>

          {proj && (
            <Stack spacing={1}>
              <Paper variant="outlined" sx={{ p:2, display:'flex', gap:3, flexWrap:'wrap' }}>
                <Chip label={`Esperado ${fmt.format(proj.total_esperado)}`} />
                <Chip label={`Proyectado ${fmt.format(proj.total_proyectado)}`} />
                <Chip label={`Pagado real ${fmt.format(proj.pagado_real)}`} color="success" />
              </Paper>

              {proj.detalle_por_tipo && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Esperado</TableCell>
                      <TableCell align="right">Proyectado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(proj.detalle_por_tipo).map(([tipo, vals]) => (
                      <TableRow key={tipo}>
                        <TableCell>{tipo}</TableCell>
                        <TableCell align="right">{fmt.format(vals.esperado)}</TableCell>
                        <TableCell align="right">{fmt.format(vals.proyectado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          )}
        </Stack>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={()=>setToast(s=>({...s, open:false}))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={()=>setToast(s=>({...s, open:false}))} severity={toast.sev} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
