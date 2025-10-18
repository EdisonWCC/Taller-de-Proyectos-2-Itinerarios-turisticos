import { Link } from "react-router-dom";
import "../../styles/Admin/AdminSidebar.css"; // tu CSS

function AdminSidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Panel Admin</h2>
      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/admin">🏠 Dashboard</Link></li>
          <li><Link to="/admin/roles">👥 Roles</Link></li>
          <li><Link to="/admin/registro">📝 Registro Turista</Link></li>
          <li><Link to="/admin/registroUsuario">📝 Registrar Usuario</Link></li>
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
