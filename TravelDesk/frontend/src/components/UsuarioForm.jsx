import { useState } from "react";
import "../styles/Admin/UsuarioForm.css";

function UsuarioForm() {
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    email: "",
    password: "",
    rol: "cliente",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del usuario:", formData);
    // 🔜 Luego se conecta con el backend (fetch o axios)
  };

  return (
    <div className="usuario-form-container">
      <h2 className="usuario-form-title">Registro Usuario</h2>
      <form className="registro-form" onSubmit={handleSubmit}>
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

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default UsuarioForm;
