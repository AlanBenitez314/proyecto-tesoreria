export interface TokenPair {
  access: string
  refresh: string
}

export interface Miembro {
  id: number
  nombre: string
  grado: string
  tipo_capita: 'Común' | 'Social'
  activo: boolean
}
