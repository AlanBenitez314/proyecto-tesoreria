import { Stack, TextField, Button, Typography } from '@mui/material';
export default function Contacto() {
  return (
    <Stack spacing={2} maxWidth={420}>
      <Typography variant="h6">Contactanos</Typography>
      <TextField label="Nombre" />
      <TextField label="Email" type="email" />
      <TextField label="Mensaje" multiline minRows={4} />
      <Button variant="contained">Enviar</Button>
    </Stack>
  );
}
