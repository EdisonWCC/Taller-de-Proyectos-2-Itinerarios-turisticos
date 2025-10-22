import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Debug: Ver qué usuario está en localStorage
  console.log('ProtectedRoute - Usuario en localStorage:', user);
  console.log('ProtectedRoute - Rol requerido:', requiredRole);

  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('ProtectedRoute - No hay usuario, redirigiendo a login');
    return <Navigate to="/" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene, redirigir al dashboard general
  if (requiredRole && user.role) {
    const userRole = user.role.toLowerCase();
    const requiredRoleLower = requiredRole.toLowerCase();

    console.log('ProtectedRoute - Rol del usuario:', userRole);
    console.log('ProtectedRoute - Rol requerido (minúsculas):', requiredRoleLower);

    if (userRole !== requiredRoleLower && !(requiredRoleLower === 'admin' && userRole === 'administrador')) {
      console.log('ProtectedRoute - Rol no coincide, redirigiendo a dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si el usuario está autenticado y tiene el rol correcto, renderizar el componente
  console.log('ProtectedRoute - Acceso permitido');
  return children;
}

export default ProtectedRoute;
