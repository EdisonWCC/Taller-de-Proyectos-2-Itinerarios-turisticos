import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Debug: Ver qué usuario está en localStorage
  console.log('=== PROTECTED ROUTE DEBUG ===');
  console.log('ProtectedRoute - Usuario en localStorage:', user);
  console.log('ProtectedRoute - Rol requerido:', requiredRole);
  console.log('ProtectedRoute - Roles permitidos:', allowedRoles);

  // Si no hay usuario, redirigir al login
  if (!user) {
    console.log('ProtectedRoute - No hay usuario, redirigiendo a login');
    return <Navigate to="/" replace />;
  }

  const userRole = user.role ? user.role.toLowerCase() : '';
  console.log('ProtectedRoute - Rol del usuario (original):', user.role);
  console.log('ProtectedRoute - Rol del usuario (minúsculas):', userRole);
  console.log('Tipo de dato del rol:', typeof user.role);

  // Si se requiere un rol específico
  if (requiredRole) {
    const requiredRoleLower = requiredRole.toLowerCase();
    console.log('ProtectedRoute - Rol requerido (minúsculas):', requiredRoleLower);
    
    const roleMatches = userRole === requiredRoleLower;
    const adminAliasMatch = requiredRoleLower === 'admin' && userRole === 'administrador';
    
    console.log('ProtectedRoute - ¿Coincide rol exacto?', roleMatches);
    console.log('ProtectedRoute - ¿Coincide alias admin?', adminAliasMatch);
    
    if (!roleMatches && !adminAliasMatch) {
      console.log('ProtectedRoute - Rol no coincide con el requerido, redirigiendo a dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si se especifican roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    console.log('ProtectedRoute - Verificando roles permitidos:', allowedRoles);
    const hasAllowedRole = allowedRoles.some(role => {
      const roleLower = role.toLowerCase();
      const matches = userRole === roleLower || (roleLower === 'admin' && userRole === 'administrador');
      console.log(`ProtectedRoute - ¿${userRole} coincide con ${roleLower}?`, matches);
      return matches;
    });

    if (!hasAllowedRole) {
      console.log('ProtectedRoute - Rol no está en la lista de permitidos, redirigiendo a dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si el usuario está autenticado y tiene el rol correcto, renderizar el componente
  console.log('ProtectedRoute - Acceso permitido');
  console.log('=== END PROTECTED ROUTE DEBUG ===');
  return children;
}

export default ProtectedRoute;
