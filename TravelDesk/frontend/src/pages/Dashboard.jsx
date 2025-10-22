import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏠</div>
        <h1 style={{
          color: '#1e293b',
          fontSize: '2rem',
          fontWeight: '700',
          margin: '0 0 16px 0'
        }}>
          Dashboard General
        </h1>

        <div style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>
            👋 ¡Bienvenido, {user?.name}!
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Has iniciado sesión como <strong>{user?.role}</strong>
          </p>
        </div>

        <p style={{
          color: '#64748b',
          fontSize: '1.1rem',
          marginBottom: '32px',
          lineHeight: 1.6
        }}>
          Bienvenido al sistema de gestión de itinerarios turísticos.
          Tu rol actual es <strong>{user?.role}</strong> y tienes acceso a las
          funcionalidades correspondientes a tu perfil de usuario.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '150px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚪 Cerrar Sesión
          </button>

          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            margin: '8px 0 0 0'
          }}>
            ¿Tienes problemas con tu cuenta? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
