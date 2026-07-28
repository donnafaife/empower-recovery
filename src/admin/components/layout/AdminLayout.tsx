import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/admin/components/layout/Sidebar'
import { Header } from '@/admin/components/layout/Header'
import { TooltipProvider } from '@/admin/components/ui/tooltip'
import { ErrorBoundary } from '@/admin/components/shared/ErrorBoundary'

const COLLAPSE_STORAGE_KEY = 'empower_admin_sidebar_collapsed'

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed))
  }, [collapsed])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="admin-shell flex h-screen w-full overflow-hidden">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="admin-scroll flex-1 overflow-y-auto p-4 sm:p-6">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
