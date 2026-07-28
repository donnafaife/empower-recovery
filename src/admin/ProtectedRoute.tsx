import { Navigate, Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/admin/hooks/useAuth'

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN']

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Checking your session…
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="admin-shell flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your account ({user.email}) doesn&apos;t have access to the admin dashboard.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
