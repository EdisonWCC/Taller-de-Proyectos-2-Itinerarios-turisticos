import { useEffect, useState } from 'react';
import UsersRolesTable from '../components/UsersRolesTable.jsx';

export default function RolesAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/usuarios')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <main>Cargando usuarios...</main>;

  return (
    <main>
      <UsersRolesTable initialUsers={users} />
    </main>
  );
}
