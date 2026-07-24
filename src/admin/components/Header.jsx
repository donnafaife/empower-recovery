import { useNavigate } from 'react-router-dom'
import { useAuth } from '../useAuth'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header className="admin-header">
      <span className="admin-header-title">Empower Recovery Admin</span>

      <div className="admin-header-user">
        <span>
          {user.name} <span className="admin-header-role">({user.role})</span>
        </span>
        <button className="admin-button admin-button-ghost" type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}

export default Header
