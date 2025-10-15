import './App.css'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import { useState } from 'react'
import RolesAdmin from './pages/RolesAdmin.jsx'
import AdminView from './views/admin/AdminView.jsx'

function App() {
  const [view, setView] = useState('registro')

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', padding: '12px' }}>
        <button onClick={() => setView('registro')} disabled={view === 'registro'}>
          Registro
        </button>
        <button onClick={() => setView('login')} disabled={view === 'login'}>
          Login
        </button>
        <button onClick={() => setView('roles')} disabled={view === 'roles'}>
          Roles
        </button>
        <button onClick={() => setView('admin')} disabled={view === 'admin'}>
          Admin
        </button>
      </div>
      {view === 'registro' && <Registro />}
      {view === 'login' && <Login />}
      {view === 'roles' && <RolesAdmin />}
      {view === 'admin' && <AdminView />}
    </>
  )
}

export default App
