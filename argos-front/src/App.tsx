import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Button, Container, Stack, Box, IconButton
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

export default function App() {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 2 }}>Argos</Typography>
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/" color="inherit">Miembros</Button>
            <Button component={RouterLink} to="/tabla" color="inherit">Tabla</Button>
            <Button component={RouterLink} to="/proyeccion" color="inherit">Proyección</Button>
            <Button component={RouterLink} to="/tesoreria" color="inherit">Tesorería</Button>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <IconButton color="inherit" onClick={logout} size="small" title="Salir">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
