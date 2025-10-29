import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import "../../styles/Admin/AdminSidebar.css";

function AdminSidebar() {
  const navigate = useNavigate();
  const [itinerariosOpen, setItinerariosOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleItinerarios = (e) => {
    e.preventDefault();
    setItinerariosOpen(!itinerariosOpen);
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Panel Admin</h2>
      <nav className="sidebar-nav">
        <ul>
          <li><Link to="/admin">🏠 Dashboard</Link></li>
          <li><Link to="/admin/roles">👥 Roles</Link></li>
          <li><Link to="/admin/registro">📝 Registro General</Link></li>
          <li><Link to="/admin/listar-turistas">👥 Listar Turistas</Link></li>
          
          {/* Sección de Itinerarios */}
          <li className="sidebar-dropdown">
            <a href="#" onClick={toggleItinerarios} className="dropdown-toggle">
              🗓️ Itinerarios
              {itinerariosOpen ? <FiChevronDown className="dropdown-icon" /> : <FiChevronRight className="dropdown-icon" />}
            </a>
            <ul className={`dropdown-menu ${itinerariosOpen ? 'show' : ''}`}>
              <li><Link to="/admin/crear-itinerario" className="dropdown-item">➕ Crear Nuevo</Link></li>
              <li><Link to="/admin/itinerarios" className="dropdown-item">📋 Listar Itinerarios</Link></li>
            </ul>
          </li>
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
