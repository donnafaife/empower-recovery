import { useEffect, useState } from 'react'
import { login as loginRequest, getCurrentUser } from './services/adminApi'
import { AuthContext } from './authContextInstance'

// Namespaced separately from telemetry's localStorage keys
// (empower_visitor_key / empower_session_id) so nothing collides.
export const TOKEN_STORAGE_KEY = 'empower_admin_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  // Only worth "loading" if there's a saved token to actually check.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)))

  // Runs once on mount: if a token was saved from a previous visit, confirm
  // it's still valid (and get the current user) before trusting it.
  useEffect(() => {
    let cancelled = false
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!storedToken) return undefined

    getCurrentUser(storedToken)
      .then((result) => {
        if (cancelled) return
        setToken(storedToken)
        setUser(result.data.user)
      })
      .catch(() => {
        // Missing/expired/invalid token - treat as logged out.
        if (cancelled) return
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email, password) {
    const result = await loginRequest(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, result.data.token)
    setToken(result.data.token)
    setUser(result.data.user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, loading, login, logout }}>{children}</AuthContext.Provider>
}
