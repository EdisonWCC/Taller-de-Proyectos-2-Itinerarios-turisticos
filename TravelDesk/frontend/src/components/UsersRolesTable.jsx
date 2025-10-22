import { useMemo, useState } from 'react';
import { ROLES } from '../utils/rbac.js';
import '../styles/Admin/UsersRolesTable.css';

export default function UsersRolesTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const roles = useMemo(() => Object.values(ROLES), []);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [saving, setSaving] = useState(false);

  async function onChangeRole(id, role) {
    setSaving(true);
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUsers(list => list.map(u => (u.id === id ? { ...u, role } : u)));
      } else {
        alert(data.error || "Error al actualizar el rol");
      }
    } catch {
      alert("Error de conexión con el servidor");
    }
    setSaving(false);
  }

  async function onChangeStatus(id, active) {
    setSaving(true);
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUsers(list => list.map(u => (u.id === id ? { ...u, active } : u)));
      } else {
        alert(data.error || "Error al cambiar estado del usuario");
      }
    } catch {
      alert("Error de conexión con el servidor");
    }
    setSaving(false);
  }

  async function onDeleteUser(id) {
    if (!confirm("¿Está seguro que desea eliminar este usuario?")) return;

    setSaving(true);
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`
        },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUsers(list => list.filter(u => u.id !== id));
      } else {
        alert(data.error || "Error al eliminar usuario");
      }
    } catch {
      alert("Error de conexión con el servidor");
    }
    setSaving(false);
  }

  const filtered = users.filter((u) => {
    const byText = !filter || `${u.name} ${u.email}`.toLowerCase().includes(filter.toLowerCase());
    const byRole = !roleFilter || u.role === roleFilter;
    return byText && byRole;
  });

  const getStatusText = (user) => {
    if (!user.active) return 'Inactivo';
    return 'Activo';
  };

  const getStatusClass = (user) => {
    if (!user.active) return 'status-inactive';
    return 'status-active';
  };

  return (
    <div className="users-roles-container">
      <h2 className="users-roles-header">Administrar Roles de Usuarios</h2>

      <div className="users-roles-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="users-roles-table-wrapper">
        <table className="users-roles-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="role-select"
                    value={u.role}
                    onChange={e => onChangeRole(u.id, e.target.value)}
                    disabled={saving}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(u)}`}>
                    {getStatusText(u)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onChangeStatus(u.id, !u.active)}
                      disabled={saving}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        background: u.active ? '#ffc107' : '#28a745',
                        color: u.active ? '#000' : '#fff'
                      }}
                      title={u.active ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {u.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      disabled={saving}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        background: '#dc3545',
                        color: '#fff'
                      }}
                      title="Eliminar usuario"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
