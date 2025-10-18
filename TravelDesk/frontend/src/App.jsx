import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminPanel from './pages/Admin/AdminPanel.jsx';
import RegistroTurista from './pages/Admin/RegistroTurista.jsx';
import RolesAdmin from './pages/Admin/RolesAdmin.jsx';
import UsuarioForm from './components/UsuarioForm.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />

        {/* Rutas del administrador */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminPanel />} />
          <Route path="registro" element={<RegistroTurista />} />
          <Route path="registroUsuario" element={<UsuarioForm/>} />
          <Route path="roles" element={<RolesAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
