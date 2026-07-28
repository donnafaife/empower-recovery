import { createContext } from 'react'
import type { AuthUser } from '@/admin/types'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Split into its own file (no components here) so Vite's fast-refresh can
// keep working for AuthContext.tsx - same reasoning as the old admin app.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
