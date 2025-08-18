import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Stack, Box } from '@mui/material';

export default function AppTripulante() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Argonautas – Tripulante</Typography>
          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
            <Button component={RouterLink} to="/mi" color="inherit">Mi cuenta</Button>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Button
            color="inherit"
            onClick={() => { localStorage.clear(); window.location.assign('/login'); }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
