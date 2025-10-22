import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, contrasena }),
      });
      const data = await res.json();
      if (data.ok) {
        // Debug: Ver qué datos está devolviendo el backend
        console.log('Datos del login:', data);
        console.log('Rol del usuario:', data.role);

        localStorage.setItem(
          "user",
          JSON.stringify({ name: data.usuario, role: data.role, token: data.token })
        );

        // Redirigir basado en el rol del usuario (case insensitive)
        const userRole = data.role ? data.role.toLowerCase() : '';
        console.log('Rol en minúsculas:', userRole);

        if (userRole === 'admin' || userRole === 'administrador') {
          console.log('Redirigiendo a admin');
          navigate('/admin');
        } else {
          console.log('Redirigiendo a dashboard general');
          navigate('/dashboard');
        }
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch {
      setError("Error de conexión con el servidor");
    }
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.reload();
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {user ? (
          <div className="logged-in-message">
            <h3>👋 ¡Bienvenido de vuelta!</h3>
            <p>Ya has iniciado sesión como <strong>{user.name}</strong></p>
          </div>
        ) : (
          <div className="login-header">
            <h2>Iniciar Sesión</h2>
            <p className="login-subtitle">Accede a tu cuenta para continuar</p>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {!user && (
            <>
              <div className="input-group">
                <label className="input-label">Usuario</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    className={`login-input ${error ? 'input-error' : ''}`}
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    className={`login-input ${error ? 'input-error' : ''}`}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="login-buttons">
                <button
                  type="submit"
                  className={`login-button primary-button ${loading ? 'loading-button' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Verificando...
                    </>
                  ) : (
                    <>
                      🚀 Entrar
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {user && (
            <div className="login-buttons">
              <button
                type="button"
                className="login-button secondary-button"
                onClick={logout}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
