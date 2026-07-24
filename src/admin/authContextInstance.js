import { createContext } from 'react'

// Split into its own file (rather than living in AuthContext.jsx) because a
// file that exports both a React component and a plain value breaks Vite's
// fast-refresh boundary detection.
export const AuthContext = createContext(null)
