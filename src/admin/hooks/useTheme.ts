import { useContext } from 'react'
import { ThemeContext } from '@/admin/context/themeContextInstance'

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
