// src/components/Turistas/EditarTuristaForm.jsx
import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Admin/EditarTuristaForm.css"; // Importa el estilo

const turistasIniciales = [];

const EditarTuristaForm = () => {
  const [turistas, setTuristas] = useState(turistasIniciales);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [turistaSeleccionado, setTuristaSeleccionado] = useState(null);
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    correo: "",
    pais: "",
  });
  const [errors, setErrors] = useState({});

  const handleSeleccionar = (turista) => {
    setTuristaSeleccionado(turista);
    setDatos({
      nombre: turista.nombre || "",
      apellido: turista.apellido || "",
      documento: turista.dni || "",
      telefono: turista.telefono || "",
      correo: turista.email || "",
      pais: turista.nacionalidad || "",
    });
  };

  useEffect(() => {
    const fetchTuristas = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const resp = await fetch("http://localhost:3000/api/turistas");
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || "Error al cargar turistas");
        setTuristas(Array.isArray(data) ? data : []);
      } catch (e) {
        setLoadError(e.message || "Error de red");
      } finally {
        setLoading(false);
      }
    };
    fetchTuristas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos({ ...datos, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const validate = (values) => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const onlyDigits = /^\d+$/;
    if (!values.nombre || values.nombre.trim().length < 2) errs.nombre = "Nombre requerido (mín. 2)";
    if (!values.apellido || values.apellido.trim().length < 2) errs.apellido = "Apellido requerido (mín. 2)";
    if (values.documento && (!onlyDigits.test(values.documento) || values.documento.length < 6)) errs.documento = "Documento inválido";
    if (values.telefono && (!onlyDigits.test(values.telefono) || values.telefono.length < 7)) errs.telefono = "Teléfono inválido";
    if (!values.correo || !emailRegex.test(values.correo)) errs.correo = "Correo inválido";
    if (!values.pais || values.pais.trim().length === 0) errs.pais = "País requerido";
    return errs;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const v = validate(datos);
  setErrors(v);
  if (Object.keys(v).length > 0) return;

  if (!turistaSeleccionado || !turistaSeleccionado.id) {
    alert("Turista inválido");
    return;
  }

  const payload = {
    nombre: datos.nombre?.trim(),
    apellido: datos.apellido?.trim(),
    nacionalidad: datos.pais?.trim(),
    dni: datos.documento ? String(datos.documento).trim() : undefined,
    pasaporte: undefined,
    fecha_nacimiento: undefined,
    genero: undefined,
    email: datos.correo ? String(datos.correo).trim() : undefined,
  };

  try {
    const resp = await fetch(`http://localhost:3000/api/turistas/${turistaSeleccionado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const be = data?.fields || {};
      const mapped = {
        nombre: be.nombre,
        apellido: be.apellido,
        pais: be.nacionalidad,
        documento: be.dni || be.pasaporte,
        correo: be.email,
      };
      setErrors((prev) => ({ ...prev, ...mapped }));
      alert(data?.error || "Error al actualizar");
      return;
    }

    // Aquí actualizas la lista localmente
    setTuristas((prevTuristas) =>
      prevTuristas.map((t) =>
        t.id === turistaSeleccionado.id
          ? { ...t, nombre: datos.nombre, apellido: datos.apellido, dni: datos.documento, email: datos.correo, nacionalidad: datos.pais }
          : t
      )
    );

    alert("Cambios guardados");
  } catch (err) {
    alert("Error de red al actualizar");
  }
};


  return (
    <div className="editar-turista-container">
      {/* Lista de turistas */}
      <div className="lista-turistas">
        <h3>Lista de Turistas</h3>
        {loading && <p>Cargando...</p>}
        {loadError && <p className="error">{loadError}</p>}
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {turistas.map(t => (
              <tr key={t.id}>
                <td>{t.nombre} {t.apellido}</td>
                <td>
                  <button onClick={() => handleSeleccionar(t)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario de edición */}
      <div className="form-edicion">
        {turistaSeleccionado ? (
          <>
            <h3>Editar Turista: {turistaSeleccionado.nombre}</h3>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input type="text" name="nombre" value={datos.nombre} onChange={handleChange} />
              {errors.nombre && <span className="error">{errors.nombre}</span>}

              <label>Apellido</label>
              <input type="text" name="apellido" value={datos.apellido} onChange={handleChange} />
              {errors.apellido && <span className="error">{errors.apellido}</span>}

              <label>Documento</label>
              <input type="text" name="documento" value={datos.documento} onChange={handleChange} />
              {errors.documento && <span className="error">{errors.documento}</span>}

              <label>Teléfono</label>
              <input type="text" name="telefono" value={datos.telefono} onChange={handleChange} />
              {errors.telefono && <span className="error">{errors.telefono}</span>}

              <label>Correo</label>
              <input type="email" name="correo" value={datos.correo} onChange={handleChange} />
              {errors.correo && <span className="error">{errors.correo}</span>}

              <label>País</label>
              <input type="text" name="pais" value={datos.pais} onChange={handleChange} />
              {errors.pais && <span className="error">{errors.pais}</span>}

              <div className="botones">
                <button type="submit">Guardar Cambios</button>
                <button type="button" onClick={() => setTuristaSeleccionado(null)}>Cancelar</button>
              </div>
            </form>
          </>
        ) : (
          <p>Selecciona un turista de la lista para editar</p>
        )}
      </div>
    </div>
  );
};

export default EditarTuristaForm;
