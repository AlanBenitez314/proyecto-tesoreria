import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { setAuthToken } from '../services/api'
import {
  Card, CardContent, TextField, Button, Typography, Stack, Alert, Box
} from '@mui/material'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { access, refresh } = await login(username, password)
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
      setAuthToken(access)
      navigate('/', { replace: true })
    } catch {
      setError('Usuario o contraseña inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display:'grid', placeItems:'center', minHeight:'100dvh', p:2 }}>
      <Card sx={{ width: 360 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Ingresar</Typography>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Usuario"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                autoFocus
              />
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Ingresando…' : 'Entrar'}
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
