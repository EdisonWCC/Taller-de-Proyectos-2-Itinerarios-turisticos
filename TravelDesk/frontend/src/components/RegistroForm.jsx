import { useState } from "react";
import "../styles/Admin/registro.css";

export default function TuristaRegistroForm() {
  const [values, setValues] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    pasaporte: "",
    nacionalidad: "",
    fecha_nacimiento: "",
    genero: "",
  });

  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!values.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!values.apellido.trim()) newErrors.apellido = "El apellido es obligatorio.";
    if (!values.dni.trim() && !values.pasaporte.trim())
      newErrors.identificacion = "Debe ingresar DNI o Pasaporte.";
    if (!values.nacionalidad.trim()) newErrors.nacionalidad = "Ingrese la nacionalidad.";
    if (!values.fecha_nacimiento) newErrors.fecha_nacimiento = "Seleccione una fecha válida.";
    if (!values.genero) newErrors.genero = "Seleccione su género.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setOk(false);
      return;
    }

    try {
      localStorage.setItem("turistaDraft", JSON.stringify(values));
      setOk(true);
      alert("Datos del turista listos. Completa el formulario de usuario y registra.");
    } catch (err) {
      setOk(false);
      alert("No se pudieron guardar los datos localmente.");
    }
  };

  return (
    <form className="container-reg" onSubmit={handleSubmit} noValidate>
      <h1>Registro de Turista</h1>

      <div className="form-group">
        <label>Nombre</label>
        <input
          name="nombre"
          type="text"
          value={values.nombre}
          onChange={handleChange}
          placeholder="Ej: Carlos"
        />
        <small className="error">{errors.nombre}</small>
      </div>

      <div className="form-group">
        <label>Apellido</label>
        <input
          name="apellido"
          type="text"
          value={values.apellido}
          onChange={handleChange}
          placeholder="Ej: Pérez"
        />
        <small className="error">{errors.apellido}</small>
      </div>

      <div className="form-group">
        <label>DNI</label>
        <input
          name="dni"
          type="text"
          value={values.dni}
          onChange={handleChange}
          placeholder="Ej: 74382910"
        />
      </div>

      <div className="form-group">
        <label>Pasaporte</label>
        <input
          name="pasaporte"
          type="text"
          value={values.pasaporte}
          onChange={handleChange}
          placeholder="Ej: XZ123456"
        />
        <small className="error">{errors.identificacion}</small>
      </div>

      <div className="form-group">
        <label>Nacionalidad</label>
        <input
          name="nacionalidad"
          type="text"
          value={values.nacionalidad}
          onChange={handleChange}
          placeholder="Ej: Peruana"
        />
        <small className="error">{errors.nacionalidad}</small>
      </div>

      <div className="form-group">
        <label>Fecha de nacimiento</label>
        <input
          name="fecha_nacimiento"
          type="date"
          value={values.fecha_nacimiento}
          onChange={handleChange}
        />
        <small className="error">{errors.fecha_nacimiento}</small>
      </div>

      <div className="form-group">
        <label>Género</label>
        <select
          name="genero"
          value={values.genero}
          onChange={handleChange}
        >
          <option value="">Selecciona...</option>
          <option value="M">Masculino</option>
          <option value="F">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <small className="error">{errors.genero}</small>
      </div>

      <button type="submit" className="btn">
        Guardar Datos de Turista
      </button>

      {ok && <p className="success">✅ Turista registrado correctamente.</p>}
    </form>
  );
}
