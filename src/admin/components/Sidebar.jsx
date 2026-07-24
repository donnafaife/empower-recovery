import { NavLink } from 'react-router-dom'

// "Analytics" / "Users" are intentionally inert placeholders - their real
// pages/routes arrive in later phases. A disabled-looking item is less
// confusing than a link that goes nowhere.
const FUTURE_NAV_ITEMS = ['Analytics', 'Users']

function navLinkClassName({ isActive }) {
  return `admin-sidebar-item${isActive ? ' admin-sidebar-item-active' : ''}`
}

function Sidebar() {
  return (
    <nav className="admin-sidebar" aria-label="Admin sections">
      <NavLink to="/admin/dashboard" className={navLinkClassName}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/leads" className={navLinkClassName}>
        Leads
      </NavLink>
      {FUTURE_NAV_ITEMS.map((item) => (
        <span key={item} className="admin-sidebar-item admin-sidebar-item-disabled" aria-disabled="true">
          {item} <span className="admin-sidebar-soon">Coming soon</span>
        </span>
      ))}
    </nav>
  )
}

export default Sidebar
