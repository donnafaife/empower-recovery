import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { AuthContext } from '@/admin/context/authContextInstance'
import { getCurrentUser, login as loginRequest } from '@/admin/lib/adminApi'
import { setUnauthorizedHandler } from '@/admin/lib/apiClient'
import { getJwtExpiryMs } from '@/admin/lib/jwt'
import type { AuthUser } from '@/admin/types'

export const TOKEN_STORAGE_KEY = 'empower_admin_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)))
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current)
      expiryTimer.current = null
    }
  }, [])

  const logout = useCallback(
    (reason?: 'expired') => {
      clearExpiryTimer()
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setToken(null)
      setUser(null)
      if (reason === 'expired') {
        toast.error('Your session has expired', { description: 'Please sign in again to continue.' })
      }
    },
    [clearExpiryTimer],
  )

  // Auto-logout the moment the JWT's own `exp` claim says it's expired,
  // instead of only reacting once some API call happens to fail.
  const scheduleExpiry = useCallback(
    (jwt: string) => {
      clearExpiryTimer()
      const expiryMs = getJwtExpiryMs(jwt)
      if (expiryMs === null) return
      const msRemaining = expiryMs - Date.now()
      if (msRemaining <= 0) {
        logout('expired')
        return
      }
      expiryTimer.current = setTimeout(() => logout('expired'), msRemaining)
    },
    [clearExpiryTimer, logout],
  )

  // Runs once on mount: if a token was saved from a previous visit, confirm
  // it's still valid (and fetch the current user) before trusting it.
  useEffect(() => {
    let cancelled = false
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!storedToken) return undefined

    const expiryMs = getJwtExpiryMs(storedToken)
    if (expiryMs !== null && expiryMs <= Date.now()) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setLoading(false)
      return undefined
    }

    getCurrentUser(storedToken)
      .then((result) => {
        if (cancelled) return
        setToken(storedToken)
        setUser(result.user)
        scheduleExpiry(storedToken)
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Any API call anywhere that gets a 401/403 with a token attached calls
  // this - catches revoked/invalid tokens the expiry timer alone can't know
  // about (e.g. the JWT secret rotated server-side).
  useEffect(() => {
    setUnauthorizedHandler(() => logout('expired'))
    return () => setUnauthorizedHandler(null)
  }, [logout])

  // Browser back/forward-cache restore can replay stale in-memory React
  // state after logout without re-running any code. logout() already clears
  // localStorage synchronously, so forcing a reload here guarantees fresh
  // state is always read from localStorage - the source of truth.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginRequest(email, password)
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token)
      setToken(result.token)
      setUser(result.user)
      scheduleExpiry(result.token)
    },
    [scheduleExpiry],
  )

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout: () => logout() }}>
      {children}
    </AuthContext.Provider>
  )
}
