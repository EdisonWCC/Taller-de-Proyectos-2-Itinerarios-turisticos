import { useState } from "react";
import "../styles/Admin/UsuarioForm.css";

function UsuarioForm() {
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    email: "",
    password: "",
    rol: "cliente",
  });

  const [turista, setTurista] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    pasaporte: "",
    nacionalidad: "",
    fecha_nacimiento: "",
    genero: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChangeTurista = (e) => {
    const { name, value } = e.target;
    setTurista({ ...turista, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turista.nombre.trim() || !turista.apellido.trim() || !turista.nacionalidad.trim() || !turista.fecha_nacimiento || !turista.genero) {
      alert("Completa los datos del turista.");
      return;
    }
    if (!turista.dni.trim() && !turista.pasaporte.trim()) {
      alert("Debe ingresar DNI o Pasaporte del turista.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/registro-completo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: formData, turista }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        alert("✅ Registro completo exitoso");
        setFormData({ nombre_usuario: "", email: "", password: "", rol: "cliente" });
        setTurista({ nombre: "", apellido: "", dni: "", pasaporte: "", nacionalidad: "", fecha_nacimiento: "", genero: "" });
      } else {
        alert("⚠️ Error: " + (data.error || "No se pudo completar el registro"));
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      alert("No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="usuario-form-container">
      <h2 className="usuario-form-title">Registro Usuario y Turista</h2>
      <form className="registro-form" onSubmit={handleSubmit}>
        <h3>Datos de Usuario</h3>
        <label>
          Nombre de usuario:
          <input
            type="text"
            name="nombre_usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Contraseña:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Rol:
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="cliente">Cliente</option>
            <option value="agente">Agente</option>
            <option value="admin">Administrador</option>
          </select>
        </label>

        <h3>Datos de Turista</h3>
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={turista.nombre}
            onChange={handleChangeTurista}
            required
          />
        </label>

        <label>
          Apellido:
          <input
            type="text"
            name="apellido"
            value={turista.apellido}
            onChange={handleChangeTurista}
            required
          />
        </label>

        <label>
          DNI:
          <input
            type="text"
            name="dni"
            value={turista.dni}
            onChange={handleChangeTurista}
          />
        </label>

        <label>
          Pasaporte:
          <input
            type="text"
            name="pasaporte"
            value={turista.pasaporte}
            onChange={handleChangeTurista}
          />
        </label>

        <label>
          Nacionalidad:
          <input
            type="text"
            name="nacionalidad"
            value={turista.nacionalidad}
            onChange={handleChangeTurista}
            required
          />
        </label>

        <label>
          Fecha de nacimiento:
          <input
            type="date"
            name="fecha_nacimiento"
            value={turista.fecha_nacimiento}
            onChange={handleChangeTurista}
            required
          />
        </label>

        <label>
          Género:
          <select name="genero" value={turista.genero} onChange={handleChangeTurista} required>
            <option value="">Selecciona...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </label>

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default UsuarioForm;
