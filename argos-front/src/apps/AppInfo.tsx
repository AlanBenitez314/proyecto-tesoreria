import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Stack } from '@mui/material';

export default function AppInfo() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Argonautas</Typography>
          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
            <Button component={RouterLink} to="/contacto" color="inherit">Contactanos</Button>
            <Button color="inherit" href="https://tripulante.argonautas.org/login">Miembros</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
