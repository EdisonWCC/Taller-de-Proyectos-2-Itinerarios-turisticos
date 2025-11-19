import { useMemo, useState, useCallback } from 'react';
import { ROLES } from '../utils/rbac.js';
import '../styles/Admin/UsersRolesTable.css';

export default function UsersRolesTable({ initialUsers }) {
  const [users, setUsers] = useState(initialUsers || []);
  const roles = useMemo(() => Object.values(ROLES), []);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [saving, setSaving] = useState(false);

  const authUser = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // === CAMBIO DE ROL ===
  const onChangeRole = useCallback(async (id, role) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authUser.token}`
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
  }, [authUser]);

  // === CAMBIO DE ESTADO ===
  const onChangeStatus = useCallback(async (id, active) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authUser.token}`
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
  }, [authUser]);

  // === ELIMINAR ===
  const onDeleteUser = useCallback(async (id) => {
    if (!confirm("¿Está seguro que desea eliminar este usuario?")) return;

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authUser.token}`
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
  }, [authUser]);

  // === FILTROS ===
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const byText =
        !filter ||
        `${u.name} ${u.email}`
          .toLowerCase()
          .includes(filter.toLowerCase());

      const byRole =
        !roleFilter || u.role === roleFilter;

      return byText && byRole;
    });
  }, [users, filter, roleFilter]);

  // === STATUS ===
  const getStatusText = (u) =>
    u.active ? "Activo" : "Inactivo";

  const getStatusClass = (u) =>
    u.active ? "status-active" : "status-inactive";

  return (
    <div className="users-roles-container">
      <h2 className="users-roles-header">Administrar Roles de Usuarios</h2>

      {/* === FILTROS === */}
      <div className="users-roles-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={saving}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          disabled={saving}
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* === TABLA === */}
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-results">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>

                  {/* === CAMBIAR ROL === */}
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
                      onChange={(e) => onChangeRole(u.id, e.target.value)}
                      disabled={saving}
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>

                  {/* === ESTADO === */}
                  <td>
                    <span className={`status-badge ${getStatusClass(u)}`}>
                      {getStatusText(u)}
                    </span>
                  </td>

                  {/* === ACCIONES === */}
                  <td>
                    <div className="actions">
                      <button
                        className={`btn-status ${u.active ? "btn-warning" : "btn-success"}`}
                        onClick={() => onChangeStatus(u.id, !u.active)}
                        disabled={saving}
                      >
                        {u.active ? "Desactivar" : "Activar"}
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => onDeleteUser(u.id)}
                        disabled={saving}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

