import { Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "../components/Sidebar/AdminSidebar.jsx";
import "../styles/Admin/AdminLayout.css";

function AdminLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Debug: Ver qué usuario está en localStorage
  console.log('AdminLayout - Usuario en localStorage:', user);

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.log('AdminLayout - No hay usuario, redirigiendo a login');
    return <Navigate to="/" replace />;
  }

  // Si el usuario no es admin (case insensitive), redirigir al dashboard general
  const userRole = user.role ? user.role.toLowerCase() : '';
  console.log('AdminLayout - Rol del usuario:', userRole);

  if (userRole !== 'admin' && userRole !== 'administrador') {
    console.log('AdminLayout - Usuario no es admin, redirigiendo a dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminLayout - Acceso permitido para admin');
  return (
    <div className="admin-layout">
      <aside className="sidebar-container">
        <AdminSidebar />
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="user-info">
            <span className="user-greeting">👋 Bienvenido, {user.name}</span>
            <span className="user-role">Rol: {user.role}</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
