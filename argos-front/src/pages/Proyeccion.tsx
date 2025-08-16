import { useEffect, useMemo, useState } from 'react'
import { getProyeccion } from '../services/proyeccion'
import {
  Stack, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  ToggleButton, ToggleButtonGroup, Grid, Paper, Typography, Divider
} from '@mui/material'

export default function Proyeccion() {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [incluirDeuda, setIncluirDeuda] = useState<boolean>(true)
  const [detalle, setDetalle] = useState<'none' | 'por_tipo' | 'por_miembro'>('none')
  const [data, setData] = useState<any | null>(null)

  const years = useMemo(() => {
    const y = new Date().getFullYear()
    return [y - 1, y, y + 1]
  }, [])

  useEffect(() => {
    getProyeccion({ year, incluir_deuda: incluirDeuda, detalle })
      .then(setData)
      .catch(() => setData(null))
  }, [year, incluirDeuda, detalle])

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Proyección</Typography>

      {/* Barra selectora */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Año</InputLabel>
          <Select label="Año" value={year} onChange={(e)=>setYear(Number(e.target.value))}>
            {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControlLabel
          control={<Checkbox checked={incluirDeuda} onChange={(e)=>setIncluirDeuda(e.target.checked)} />}
          label="Incluir deuda"
        />

        <ToggleButtonGroup
          exclusive
          size="small"
          value={detalle}
          onChange={(_,v)=> v && setDetalle(v)}
        >
          <ToggleButton value="none">Sin detalle</ToggleButton>
          <ToggleButton value="por_tipo">Por tipo</ToggleButton>
          <ToggleButton value="por_miembro">Por miembro</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {data && (
        <Paper variant="outlined" sx={{ p:2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Total esperado</Typography>
              <Typography variant="h6">${data.total_esperado.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Total proyectado</Typography>
              <Typography variant="h6">${data.total_proyectado.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">Pagado real</Typography>
              <Typography variant="h6">${data.pagado_real.toLocaleString()}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my:2 }} />
          <pre style={{ margin:0 }}>{JSON.stringify(data, null, 2)}</pre>
        </Paper>
      )}
    </Stack>
  )
}
