import { Navigate, Route, Routes } from 'react-router-dom'
import './admin.css'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'

// Mounted at /admin/* by src/main.jsx - routes below are relative to that.
function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetail />} />
        </Route>
        <Route index element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default AdminApp
