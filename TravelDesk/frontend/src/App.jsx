import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import MainLayout from "./layouts/MainLayout/MainLayout";
import AdminPanel from './pages/Admin/AdminPanel.jsx';
import RegistroGeneral from './pages/Admin/RegistroGeneral.jsx';
import RolesAdmin from './pages/Admin/RolesAdmin.jsx';
import ListarTuristas from './pages/Admin/ListarTuristas.jsx';
import ItinerarioCreatePage from './pages/Admin/Itinerario/ItinerarioCreatePage.jsx';
import LListarItinerario from './pages/Admin/ListarItinerario/LListarItinerario.jsx';
import EditarItinerario from './components/LIstarItinerarios/EditarItinerario.jsx';
import ResumenFinal from './components/Itinerario/ResumenFinal.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Inicio from './pages/turista/Inicio';
import MisViajes from './pages/turista/MisViajes';
import Perfil from './pages/turista/Perfil';
import Ajustes from './pages/turista/Ajustes';
import Notificaciones from './pages/turista/Notificaciones';

// Componente para redirigir según el rol del usuario
function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log('=== DASHBOARD REDIRECT DEBUG ===');
  console.log('DashboardRedirect - Usuario en localStorage:', user);
  
  const userRole = user?.role ? user.role.toLowerCase() : '';
  console.log('DashboardRedirect - Rol del usuario (original):', user?.role);
  console.log('DashboardRedirect - Rol del usuario (minúsculas):', userRole);
  console.log('DashboardRedirect - Tipo de dato del rol:', typeof user?.role);
  
  if (userRole === 'admin' || userRole === 'administrador') {
    console.log('DashboardRedirect - Redirigiendo a /admin');
    console.log('=== END DASHBOARD REDIRECT DEBUG ===');
    return <Navigate to="/admin" replace />;
  } else {
    console.log('DashboardRedirect - Redirigiendo a /turista/inicio');
    console.log('=== END DASHBOARD REDIRECT DEBUG ===');
    return <Navigate to="/turista/inicio" replace />;
  }
}
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas del administrador - Protegidas */}
        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminPanel />} />
          <Route path="registro" element={<RegistroGeneral />} />
          <Route path="roles" element={<RolesAdmin />} />
          <Route path="listar-turistas" element={<ListarTuristas />} />
          <Route path="itinerarios" element={<LListarItinerario />} />
          <Route path="itinerarios/:id/resumen" element={<ResumenFinal />} />
          <Route path="editar-itinerario/:id" element={<EditarItinerario />} />
          <Route path="crear-itinerario" element={<ItinerarioCreatePage />} />
        </Route>

        {/* Rutas del turista - Protegidas */}
        <Route path="/turista/*" element={
          <ProtectedRoute allowedRoles={['turista', 'cliente']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<Inicio />} />
          <Route path="itinerarios" element={<MisViajes />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>

        {/* Ruta de redirección para /dashboard - redirige según rol */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
