import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'

// Lazy-loaded so the admin dashboard's code and CSS are only ever fetched
// by someone navigating to /admin - the public site's bundle never includes
// them at all.
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
