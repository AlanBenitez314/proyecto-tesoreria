// TablaEstados.tsx
import { useEffect, useState } from 'react';
import { getTablaEstados } from '../services/estados';
import {
  Stack, TextField, Table, TableHead, TableRow, TableCell, TableBody, Typography, Box, Paper
} from '@mui/material';
import EstadoCell from '../components/EstadoCell';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function TablaEstados() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    getTablaEstados(year).then(d => setRows(d.rows));
  }, [year]);

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h6">Tabla de estados</Typography>
      <TextField
        label="Año" size="small" type="number"
        value={year} onChange={e=>setYear(Number(e.target.value))}
        sx={{ maxWidth: 160 }}
      />

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell align="left">Miembro</TableCell>
                <TableCell align="center">Grado</TableCell>
                <TableCell align="center">Tipo</TableCell>
                {MESES.map((m, idx) => (
                  <TableCell key={idx} align="center">{m}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r:any)=>(
                <TableRow key={r.miembro_id} hover>
                  <TableCell align="left">{r.nombre}</TableCell>
                  <TableCell align="center">{r.grado}</TableCell>
                  <TableCell align="center">{r.tipo_capita}</TableCell>

                  {Array.from({length:12},(_,i)=>i+1).map((mesNum) => {
                    const key = String(mesNum);
                    const current = r[key] as 'pagada'|'debe'|'exento';
                    return (
                      <TableCell key={key} align="center">
                        <EstadoCell
                          miembroId={r.miembro_id}
                          anio={year}
                          mes={mesNum}
                          value={current}
                          onChangeLocal={(next) => {
                            setRows(prev =>
                              prev.map(row =>
                                row.miembro_id === r.miembro_id
                                  ? { ...row, [key]: next }
                                  : row
                              )
                            );
                          }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Stack>
  );
}
