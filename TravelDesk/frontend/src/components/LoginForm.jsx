import { useState } from "react";

export default function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        localStorage.setItem(
          "user",
          JSON.stringify({ name: data.usuario, role: data.role, token: data.token })
        );
        window.location.reload(); // Recarga para actualizar el estado
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
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <div>
        <label>Usuario</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          disabled={!!user}
        />
      </div>
      <div>
        <label>Contraseña</label>
        <input
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
          disabled={!!user}
        />
      </div>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <button type="submit" disabled={loading || !!user}>
        {loading ? "Verificando..." : "Entrar"}
      </button>
      {user && (
        <button type="button" onClick={logout} style={{ marginLeft: 12 }}>
          Cerrar sesión
        </button>
      )}
    </form>
  );
}
