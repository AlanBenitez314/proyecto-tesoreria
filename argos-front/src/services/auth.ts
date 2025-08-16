import { api } from './api';

export interface TokenPair {
  access: string;
  refresh: string;
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const r = await api.post<TokenPair>('/auth/token/', { username, password });
  return r.data;
}
