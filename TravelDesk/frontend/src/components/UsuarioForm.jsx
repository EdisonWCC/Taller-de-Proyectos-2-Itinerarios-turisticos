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

  const [errors, setErrors] = useState({
    usuario: {},
    turista: {},
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // === VALIDACIONES ===
  const validations = {
    nombre_usuario: (value) => {
      if (!value) return "El nombre de usuario es requerido";
      if (value.length < 3) return "Debe tener al menos 3 caracteres";
      if (value.length > 50) return "No puede superar 50 caracteres";
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Solo letras, números y guion bajo";
      return null;
    },
    email: (value) => {
      if (!value) return "El email es requerido";
      if (!emailRegex.test(value)) return "Email inválido";
      return null;
    },
    password: (value) => {
      if (!value) return "Contraseña requerida";
      if (value.length < 8) return "Debe tener al menos 8 caracteres";
      if (!/[A-Z]/.test(value)) return "Debe tener al menos una mayúscula";
      if (!/[a-z]/.test(value)) return "Debe tener al menos una minúscula";
      if (!/[0-9]/.test(value)) return "Debe tener al menos un número";
      if (!/[^A-Za-z0-9]/.test(value)) return "Debe tener un caracter especial";
      return null;
    },
    rol: (value) => {
      if (!['cliente', 'agente', 'admin'].includes(value)) return "Rol inválido";
      return null;
    },
    nombre: (value) => !value ? "El nombre es requerido" : /^[a-zA-ZÀ-ÿ\s]+$/.test(value) ? null : "Solo letras y espacios",
    apellido: (value) => !value ? "El apellido es requerido" : /^[a-zA-ZÀ-ÿ\s]+$/.test(value) ? null : "Solo letras y espacios",
    dni: (value) => {
      if (!value) return null;
      if (!/^[0-9]+$/.test(value)) return "Solo números";
      if (value.length < 7 || value.length > 8) return "Entre 7 y 8 caracteres";
      return null;
    },
    pasaporte: (value) => {
      if (!value) return null;
      if (!/^[A-Za-z0-9]+$/.test(value)) return "Solo letras y números";
      if (value.length < 6 || value.length > 20) return "Entre 6 y 20 caracteres";
      return null;
    },
    nacionalidad: (value) => !value ? "Requerido" : /^[a-zA-ZÀ-ÿ\s]+$/.test(value) ? null : "Solo letras y espacios",
    fecha_nacimiento: (value) => {
      if (!value) return "Requerido";
      const edad = new Date().getFullYear() - new Date(value).getFullYear();
      if (edad < 18) return "Debes tener al menos 18 años";
      return null;
    },
    genero: (value) => !['M', 'F', 'Otro'].includes(value) ? "Género inválido" : null,
  };

  // === HANDLERS ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, usuario: { ...prev.usuario, [name]: validations[name]?.(value) } }));
  };

  const handleChangeTurista = (e) => {
    const { name, value } = e.target;
    setTurista((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, turista: { ...prev.turista, [name]: validations[name]?.(value) } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turista.dni.trim() && !turista.pasaporte.trim()) {
      alert("Debe ingresar DNI o Pasaporte");
      return;
    }

    const hasErrors = Object.values(errors.usuario).some(Boolean) || Object.values(errors.turista).some(Boolean);
    if (hasErrors) {
      alert("Corrige los errores antes de enviar");
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
        alert("✅ Registro exitoso");
        setFormData({ nombre_usuario: "", email: "", password: "", rol: "cliente" });
        setTurista({ nombre: "", apellido: "", dni: "", pasaporte: "", nacionalidad: "", fecha_nacimiento: "", genero: "" });
        setErrors({ usuario: {}, turista: {} });
      } else {
        alert("⚠️ Error: " + (data.error || "No se pudo completar el registro"));
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="usuario-form-container">
      <h2 className="usuario-form-title">Registro Usuario y Turista</h2>
      <form className="registro-form" onSubmit={handleSubmit}>

        <fieldset>
          <legend>Datos de Usuario</legend>
          {['nombre_usuario', 'email', 'password', 'rol'].map((field) => (
            <label key={field}>
              {field === 'rol' ? 'Rol:' : field.replace('_', ' ').toUpperCase() + ':'}
              {field === 'rol' ? (
                <select name={field} value={formData[field]} onChange={handleChange}>
                  <option value="cliente">Cliente</option>
                  <option value="agente">Agente</option>
                  <option value="admin">Administrador</option>
                </select>
              ) : (
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              )}
              {errors.usuario[field] && <span className="error-message">{errors.usuario[field]}</span>}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Datos de Turista</legend>
          {['nombre', 'apellido', 'dni', 'pasaporte', 'nacionalidad', 'fecha_nacimiento', 'genero'].map((field) => (
            <label key={field}>
              {field.replace('_', ' ').toUpperCase() + ':'}
              {field === 'genero' ? (
                <select name={field} value={turista[field]} onChange={handleChangeTurista} required>
                  <option value="">Selecciona...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              ) : (
                <input
                  type={field === 'fecha_nacimiento' ? 'date' : 'text'}
                  name={field}
                  value={turista[field]}
                  onChange={handleChangeTurista}
                  required={['nombre','apellido','nacionalidad','fecha_nacimiento','genero'].includes(field)}
                />
              )}
              {['dni','pasaporte'].includes(field) && <small className="field-hint">Opcional si tiene {field === 'dni' ? 'pasaporte' : 'DNI'}</small>}
              {errors.turista[field] && <span className="error-message">{errors.turista[field]}</span>}
            </label>
          ))}
        </fieldset>

        <button type="submit" className="btn-submit">Registrar</button>
      </form>
    </div>
  );
}

export default UsuarioForm;
