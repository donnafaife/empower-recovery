// "Leads" / "Analytics" / "Users" are intentionally inert placeholders -
// their real pages/routes arrive in later phases. A disabled-looking item
// is less confusing than a link that goes nowhere.
const FUTURE_NAV_ITEMS = ['Leads', 'Analytics', 'Users']

function Sidebar() {
  return (
    <nav className="admin-sidebar" aria-label="Admin sections">
      <span className="admin-sidebar-item admin-sidebar-item-active">Dashboard</span>
      {FUTURE_NAV_ITEMS.map((item) => (
        <span key={item} className="admin-sidebar-item admin-sidebar-item-disabled" aria-disabled="true">
          {item} <span className="admin-sidebar-soon">Coming soon</span>
        </span>
      ))}
    </nav>
  )
}

export default Sidebar
