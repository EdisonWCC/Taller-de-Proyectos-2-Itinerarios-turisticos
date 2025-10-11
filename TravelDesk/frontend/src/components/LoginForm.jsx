import { useState } from "react";

export default function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (res.ok && data.ok) {
        alert("¡Bienvenido " + data.usuario + "!");
        // Aquí puedes redirigir o guardar el usuario en contexto
      } else {
        setError(data.error || "Error desconocido. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
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
        />
      </div>
      <div>
        <label>Contraseña</label>
        <input
          type="password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
      </div>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Verificando..." : "Entrar"}
      </button>
    </form>
  );
}
