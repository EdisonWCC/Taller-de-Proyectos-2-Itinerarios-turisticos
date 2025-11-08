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
          <ProtectedRoute allowedRoles={['turista', 'admin']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<Inicio />} />
          <Route path="mis-viajes" element={<MisViajes />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>

        {/* Ruta de redirección para /dashboard (mantenida por compatibilidad) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navigate to="/turista/inicio" replace />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
