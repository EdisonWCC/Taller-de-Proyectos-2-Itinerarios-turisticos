import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminPanel from './pages/Admin/AdminPanel.jsx';
import RegistroGeneral from './pages/Admin/RegistroGeneral.jsx';
import RolesAdmin from './pages/Admin/RolesAdmin.jsx';
import ListarTuristas from './pages/Admin/ListarTuristas.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
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
        </Route>

        {/* Dashboard general para otros roles */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
