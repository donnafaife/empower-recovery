import { useLocation } from 'react-router-dom'
import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { NAV_ITEMS } from '@/admin/components/layout/navConfig'
import { Avatar, AvatarFallback } from '@/admin/components/ui/avatar'
import { Button } from '@/admin/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/admin/components/ui/dropdown-menu'
import { useAuth } from '@/admin/hooks/useAuth'
import { useTheme } from '@/admin/hooks/useTheme'
import { initialsFrom } from '@/admin/lib/format'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  // Session detail pages (/admin/sessions/:id) aren't in the nav themselves -
  // they're reached from a visitor's session list, so they're treated as
  // part of the Visitors section for this label.
  const effectivePath = location.pathname.startsWith('/admin/sessions') ? '/admin/visitors' : location.pathname
  const currentPage = NAV_ITEMS.find((item) => effectivePath.startsWith(item.to))

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/60 px-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <h2 className="truncate text-sm font-semibold text-foreground">{currentPage?.label ?? 'Admin'}</h2>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="ml-1 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user ? initialsFrom(user.name) : '?'}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
