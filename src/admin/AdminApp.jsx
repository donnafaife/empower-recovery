import { Navigate, Route, Routes } from 'react-router-dom'
import './admin.css'

// New admin experience (TypeScript + shadcn/ui) - dashboard, visitor
// analytics, and everything reachable from the sidebar/layout shell.
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute.tsx'
import { AdminLayout } from './components/layout/AdminLayout'
import { Toaster } from './components/ui/sonner'
import { Login } from './pages/Login.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Visitors } from './pages/Visitors.tsx'
import { VisitorDetail } from './pages/VisitorDetail.tsx'
import { SessionDetail } from './pages/SessionDetail.tsx'

// Leads pages haven't been rebuilt in the new design system yet, so they
// keep running on their original auth/layout stack (own Header/Sidebar,
// plain CSS) until that migration happens. Both auth stacks read the same
// `empower_admin_token` localStorage key, so signing in once covers both.
import { AuthProvider as LegacyAuthProvider } from './AuthContext.jsx'
import LegacyProtectedRoute from './ProtectedRoute.jsx'
import Leads from './pages/Leads.jsx'
import LeadDetail from './pages/LeadDetail.jsx'

// Mounted at /admin/* by src/main.jsx - routes below are relative to that.
function AdminApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="visitors" element={<Visitors />} />
              <Route path="visitors/:id" element={<VisitorDetail />} />
              <Route path="sessions/:id" element={<SessionDetail />} />
            </Route>
          </Route>

          <Route
            element={
              <LegacyAuthProvider>
                <LegacyProtectedRoute />
              </LegacyAuthProvider>
            }
          >
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
          </Route>

          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default AdminApp
