import { Link, useNavigate } from "react-router-dom";
import "../../styles/Admin/AdminSidebar.css"; // tu CSS

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Panel Admin</h2>
      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/admin">🏠 Dashboard</Link></li>
          <li><Link to="/admin/roles">👥 Roles</Link></li>
          <li><Link to="/admin/registro">📝 Registro General</Link></li>
          <li><Link to="/admin/editar-turista">📝 Editar Turista</Link></li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
