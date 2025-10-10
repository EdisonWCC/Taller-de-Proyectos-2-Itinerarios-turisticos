import { ALL_PERMISSIONS_LIST, ROLES, hasPermission } from '../utils/rbac';
import '../styles/registro.css';

export default function PermissionsMatrix() {
  const roles = Object.values(ROLES);
  const perms = ALL_PERMISSIONS_LIST;

  return (
    <div className="container-reg" style={{ overflowX: 'auto' }}>
      <h2>Matriz de Permisos por Rol</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Permiso</th>
            {roles.map((role) => (
              <th key={role} style={th}>{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {perms.map((perm) => (
            <tr key={perm}>
              <td style={tdLeft}>{perm}</td>
              {roles.map((role) => (
                <td key={role + perm} style={tdCenter}>
                  {hasPermission(role, perm) ? '✅' : '❌'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' };
const tdLeft = { borderBottom: '1px solid #eee', padding: '8px', textAlign: 'left' };
const tdCenter = { borderBottom: '1px solid #eee', padding: '8px', textAlign: 'center' };
