import { useMemo, useState } from 'react';
import { ROLES } from '../utils/rbac.js';
import '../styles/registro.css';

// Diseño-only: tabla de usuarios con selector de rol (sin conexión a backend)
export default function UsersRolesTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const roles = useMemo(() => Object.values(ROLES), []);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  function onChangeRole(id, role) {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  const filtered = users.filter((u) => {
    const byText = !filter || `${u.name} ${u.email}`.toLowerCase().includes(filter.toLowerCase());
    const byRole = !roleFilter || u.role === roleFilter;
    return byText && byRole;
  });

  return (
    <div className="container-reg" style={{ overflowX: 'auto' }}>
      <h2>Administrar Roles de Usuarios</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Usuario</th>
            <th style={th}>Email</th>
            <th style={th}>Rol</th>
            <th style={th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id}>
              <td style={td}>{u.name}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <select value={u.role} onChange={(e) => onChangeRole(u.id, e.target.value)}>
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td style={td}>{u.active ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" type="button" onClick={() => { /* diseño-only */ }}>
          Guardar cambios
        </button>
        <button className="btn" type="button" onClick={() => setUsers(initialUsers || [])}>
          Deshacer cambios
        </button>
      </div>
    </div>
  );
}

const th = { borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#fafafa' };
const td = { borderBottom: '1px solid #eee', padding: '8px' };
