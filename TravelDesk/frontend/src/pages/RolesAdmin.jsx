import UsersRolesTable from '../components/UsersRolesTable.jsx';
import { ROLES } from '../utils/rbac.js';

const mockUsers = [
  { id: 1, name: 'Ana López', email: 'ana@turismo.com', role: ROLES.ADMIN, active: true },
  { id: 2, name: 'Carlos Pérez', email: 'carlos@turismo.com', role: ROLES.SUBADMIN, active: true },
  { id: 3, name: 'Lucía Gómez', email: 'lucia@cliente.com', role: ROLES.TURISTA, active: true },
  { id: 4, name: 'Miguel Ruiz', email: 'miguel@cliente.com', role: ROLES.TURISTA, active: false },
];

export default function RolesAdmin() {
  return (
    <main>
      <UsersRolesTable initialUsers={mockUsers} />
    </main>
  );
}
