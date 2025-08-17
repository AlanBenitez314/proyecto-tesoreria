import { useState } from 'react'
import { login } from '../services/auth'

interface Props {
  onLogin: (access: string, refresh: string) => void
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const t = await login(username, password)
      onLogin(t.access, t.refresh)
    } catch (err: any) {
      setError('Credenciales inválidas o error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display:'grid', gap:8, maxWidth:320 }}>
      <h2>Ingresar</h2>
      <label>
        Usuario
        <input value={username} onChange={e=>setUsername(e.target.value)} />
      </label>
      <label>
        Contraseña
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando…' : 'Entrar'}
      </button>
      {error && <div style={{ color:'crimson' }}>{error}</div>}
    </form>
  )
}
