import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN']

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="admin-status-message">Checking your session…</p>
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return (
      <p className="admin-status-message">
        Your account ({user.email}) doesn&apos;t have access to the admin dashboard.
      </p>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
