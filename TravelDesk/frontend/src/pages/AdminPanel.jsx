import { useState } from 'react';
import PermissionsMatrix from '../components/PermissionsMatrix.jsx';
import { ROLES, PERMISSIONS, hasPermission } from '../utils/rbac.js';
import '../styles/registro.css';

export default function AdminPanel() {
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);

  const actions = [
    { key: PERMISSIONS.MANAGE_USERS, label: 'Gestionar usuarios' },
    { key: PERMISSIONS.MANAGE_PACKAGES, label: 'Gestionar paquetes turísticos' },
    { key: PERMISSIONS.MANAGE_CONTENT, label: 'Gestionar contenido del sitio' },
    { key: PERMISSIONS.VIEW_BOOKINGS, label: 'Ver reservas' },
    { key: PERMISSIONS.CREATE_BOOKING, label: 'Crear reserva' },
    { key: PERMISSIONS.CANCEL_BOOKING, label: 'Cancelar reserva' },
    { key: PERMISSIONS.VIEW_REPORTS, label: 'Ver reportes' },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div className="container-reg">
        <h1>Panel de Administración</h1>
        <div className="form-group">
          <label htmlFor="role">Vista previa de permisos por rol</label>
          <select id="role" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <h3>Acciones disponibles para: {selectedRole}</h3>
          <ul>
            {actions.map((a) => (
              <li key={a.key} style={{ margin: '6px 0' }}>
                {a.label} {hasPermission(selectedRole, a.key) ? '✅' : '❌'}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <PermissionsMatrix />
    </div>
  );
}
