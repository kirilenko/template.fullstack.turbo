export type AuthRole = 'admin' | 'user'

export interface AuthState {
  isAuthenticated: boolean
  role: AuthRole | null
}
