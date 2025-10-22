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

  const emailRegex = /^[^\/s@]+@[^\/s@]+\.[^\/s@]+$/;

  const validateNombreUsuario = (nombre) => {
    if (!nombre) return "El nombre de usuario es requerido";
    if (nombre.length < 3) return "El nombre de usuario debe tener al menos 3 caracteres";
    if (nombre.length > 50) return "El nombre de usuario no puede tener más de 50 caracteres";
    if (!/^[a-zA-Z0-9_]+$/.test(nombre)) return "El nombre de usuario solo puede contener letras, números y guion bajo";
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return "El email es requerido";
    if (!emailRegex.test(email)) return "El email es inválido";
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.";
    if (!/[A-Z]/.test(password)) return "La contraseña debe tener al menos una mayúscula";
    if (!/[a-z]/.test(password)) return "La contraseña debe tener al menos una minúscula";
    if (!/[0-9]/.test(password)) return "La contraseña debe tener al menos un número";
    if (!/[^A-Za-z0-9]/.test(password)) return "La contraseña debe tener al menos un caracter especial";
    return null;
  };

  const validateRol = (rol) => {
    const rolesValidos = ['cliente', 'agente', 'admin'];
    if (!rolesValidos.includes(rol)) return "Rol inválido";
    return null;
  };

  const validateNombre = (nombre) => {
    if (!nombre) return "El nombre es requerido";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre)) return "El nombre debe contener solo letras y espacios";
    return null;
  };

  const validateApellido = (apellido) => {
    if (!apellido) return "El apellido es requerido";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(apellido)) return "El apellido debe contener solo letras y espacios";
    return null;
  };

  const validateDNI = (dni) => {
    if (!dni) return null; // DNI es opcional si hay pasaporte
    if (!/^[0-9]+$/.test(dni)) return "El DNI debe contener solo números";
    if (dni.length < 7 || dni.length > 8) return "El DNI debe tener entre 7 y 8 caracteres";
    return null;
  };

  const validatePasaporte = (pasaporte) => {
    if (!pasaporte) return null; // Pasaporte es opcional si hay DNI
    if (!/^[A-Za-z0-9]+$/.test(pasaporte)) return "El pasaporte debe contener solo números y letras";
    if (pasaporte.length < 6 || pasaporte.length > 20) return "El pasaporte debe tener entre 6 y 20 caracteres";
    return null;
  };

  const validateNacionalidad = (nacionalidad) => {
    if (!nacionalidad) return "La nacionalidad es requerida";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nacionalidad)) return "La nacionalidad debe contener solo letras y espacios";
    return null;
  };

  const validateFechaNacimiento = (fecha) => {
    if (!fecha) return "La fecha de nacimiento es requerida";
    const fechaNacimiento = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    if (edad < 18) return "Debes tener al menos 18 años para registrarte";
    return null;
  };

  const validateGenero = (genero) => {
    if (!genero) return "El género es requerido";
    const generosValidos = ['M', 'F', 'Otro'];
    if (!generosValidos.includes(genero)) return "Género inválido";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let error = null;
    switch (name) {
      case 'nombre_usuario':
        error = validateNombreUsuario(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'rol':
        error = validateRol(value);
        break;
      default:
        break;
    }
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, usuario: { ...errors.usuario, [name]: error } });
  };

  const handleChangeTurista = (e) => {
    const { name, value } = e.target;
    let error = null;
    switch (name) {
      case 'nombre':
        error = validateNombre(value);
        break;
      case 'apellido':
        error = validateApellido(value);
        break;
      case 'dni':
        error = validateDNI(value);
        break;
      case 'pasaporte':
        error = validatePasaporte(value);
        break;
      case 'nacionalidad':
        error = validateNacionalidad(value);
        break;
      case 'fecha_nacimiento':
        error = validateFechaNacimiento(value);
        break;
      case 'genero':
        error = validateGenero(value);
        break;
      default:
        break;
    }
    setTurista({ ...turista, [name]: value });
    setErrors({ ...errors, turista: { ...errors.turista, [name]: error } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que al menos DNI o pasaporte esté presente
    if (!turista.dni.trim() && !turista.pasaporte.trim()) {
      alert("Debe ingresar DNI o Pasaporte del turista");
      return;
    }

    // Verificar si hay errores de validación
    const hasErrors = Object.values(errors.usuario).some(error => error !== null) ||
                     Object.values(errors.turista).some(error => error !== null);

    if (hasErrors) {
      alert("Por favor, corrige los errores en el formulario antes de enviar");
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
        // Limpiar formulario y errores
        setFormData({ nombre_usuario: "", email: "", password: "", rol: "cliente" });
        setTurista({ nombre: "", apellido: "", dni: "", pasaporte: "", nacionalidad: "", fecha_nacimiento: "", genero: "" });
        setErrors({ usuario: {}, turista: {} });
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
          {errors.usuario.nombre_usuario && <span className="error-message">{errors.usuario.nombre_usuario}</span>}
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
          {errors.usuario.email && <span className="error-message">{errors.usuario.email}</span>}
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
          <small className="password-hint">La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.</small>
          {errors.usuario.password && <span className="error-message">{errors.usuario.password}</span>}
        </label>

        <label>
          Rol:
          <select name="rol" value={formData.rol} onChange={handleChange}>
            <option value="cliente">Cliente</option>
            <option value="agente">Agente</option>
            <option value="admin">Administrador</option>
          </select>
          {errors.usuario.rol && <span className="error-message">{errors.usuario.rol}</span>}
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
          {errors.turista.nombre && <span className="error-message">{errors.turista.nombre}</span>}
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
          {errors.turista.apellido && <span className="error-message">{errors.turista.apellido}</span>}
        </label>

        <label>
          DNI:
          <input
            type="text"
            name="dni"
            value={turista.dni}
            onChange={handleChangeTurista}
          />
          <small className="field-hint">Opcional si tiene pasaporte</small>
          {errors.turista.dni && <span className="error-message">{errors.turista.dni}</span>}
        </label>

        <label>
          Pasaporte:
          <input
            type="text"
            name="pasaporte"
            value={turista.pasaporte}
            onChange={handleChangeTurista}
          />
          <small className="field-hint">Opcional si tiene DNI</small>
          {errors.turista.pasaporte && <span className="error-message">{errors.turista.pasaporte}</span>}
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
          {errors.turista.nacionalidad && <span className="error-message">{errors.turista.nacionalidad}</span>}
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
          {errors.turista.fecha_nacimiento && <span className="error-message">{errors.turista.fecha_nacimiento}</span>}
        </label>

        <label>
          Género:
          <select name="genero" value={turista.genero} onChange={handleChangeTurista} required>
            <option value="">Selecciona...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.turista.genero && <span className="error-message">{errors.turista.genero}</span>}
        </label>

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
}

export default UsuarioForm;
