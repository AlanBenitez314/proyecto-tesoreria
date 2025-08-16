import { useEffect, useState } from 'react';
import { getTablaEstados } from '../services/estados';
import {
  Stack, TextField, Table, TableHead, TableRow, TableCell, TableBody, Typography
} from '@mui/material';
import EstadoCell from '../components/EstadoCell';

export default function TablaEstados() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    getTablaEstados(year).then(d => setRows(d.rows));
  }, [year]);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Tabla de estados</Typography>
      <TextField
        label="Año" size="small" type="number"
        value={year} onChange={e=>setYear(Number(e.target.value))}
        sx={{ maxWidth: 160 }}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Miembro</TableCell>
            <TableCell>Grado</TableCell>
            <TableCell>Tipo</TableCell>
            {Array.from({length:12},(_,i)=>i+1).map(m=><TableCell key={m}>{m}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r:any)=>(
            <TableRow key={r.miembro_id}>
              <TableCell>{r.nombre}</TableCell>
              <TableCell>{r.grado}</TableCell>
              <TableCell>{r.tipo_capita}</TableCell>

              {Array.from({length:12},(_,i)=>i+1).map((mesNum) => {
                const key = String(mesNum);
                const current = r[key] as 'pagada'|'debe'|'exento';

                return (
                  <TableCell key={key}>
                    <EstadoCell
                      miembroId={r.miembro_id}
                      anio={year}
                      mes={mesNum}
                      value={current}
                      onChangeLocal={(next) => {
                        // actualiza SOLO esa celda localmente
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
    </Stack>
  );
}
