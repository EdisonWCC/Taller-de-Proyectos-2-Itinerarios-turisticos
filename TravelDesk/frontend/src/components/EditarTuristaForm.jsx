// src/components/Turistas/EditarTuristaForm.jsx - Convertido a Modal
import  { useState, useEffect } from "react";
import "../styles/Admin/EditarTuristaForm.css";

// Props que recibe el componente como modal
// isOpen: boolean - si el modal está abierto
// onClose: function - función para cerrar el modal
// turistaSeleccionado: object - el turista a editar
// onSave: function - función para notificar que se guardó (para refrescar la tabla)

const EditarTuristaForm = ({ isOpen, onClose, turistaSeleccionado, onSave }) => {
  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    telefono: "",
    correo: "",
    pais: "",
    genero: "",
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Actualizar datos cuando cambia el turista seleccionado
  useEffect(() => {
    if (turistaSeleccionado) {
      setDatos({
        nombre: turistaSeleccionado.nombre || "",
        apellido: turistaSeleccionado.apellido || "",
        documento: turistaSeleccionado.dni || turistaSeleccionado.documento || "",
        telefono: turistaSeleccionado.telefono || "",
        correo: turistaSeleccionado.email || "",
        pais: turistaSeleccionado.nacionalidad || "",
        genero: turistaSeleccionado.genero || "",
        activo: turistaSeleccionado.activo !== undefined ? turistaSeleccionado.activo : true
      });
    }
  }, [turistaSeleccionado]);

  // Limpiar errores cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDatos(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${turistaSeleccionado.nombre} ${turistaSeleccionado.apellido}?`)) {
      return;
    }

    try {
      const resp = await fetch(`http://localhost:3000/api/turistas/${turistaSeleccionado.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        alert(data?.error || "Error al eliminar turista");
        return;
      }

      alert("Turista eliminado exitosamente");
      onSave(); // Notificar que se actualizó
      onClose(); // Cerrar modal
    } catch (err) {
      alert("Error de red al eliminar turista");
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
    if (!values.genero || values.genero.trim().length === 0) errs.genero = "Género requerido";

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

    setLoading(true);
    const payload = {
      nombre: datos.nombre?.trim(),
      apellido: datos.apellido?.trim(),
      nacionalidad: datos.pais?.trim(),
      dni: datos.documento ? String(datos.documento).trim() : undefined,
      pasaporte: undefined,
      fecha_nacimiento: undefined,
      genero: datos.genero?.trim(),
      email: datos.correo ? String(datos.correo).trim() : undefined,
      telefono: datos.telefono ? String(datos.telefono).trim() : undefined,
      activo: datos.activo
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
          genero: be.genero,
          telefono: be.telefono
        };
        setErrors(prev => ({ ...prev, ...mapped }));
        alert(data?.error || "Error al actualizar");
        return;
      }

      alert("Cambios guardados");
      onSave(); // Notificar que se actualizó
      onClose(); // Cerrar modal
    } catch (err) {
      alert("Error de red al actualizar");
    } finally {
      setLoading(false);
    }
  };

  // No renderizar si el modal no está abierto o no hay turista seleccionado
  if (!isOpen || !turistaSeleccionado) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Editar Turista: {turistaSeleccionado.nombre}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="form-edicion">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="nombre" value={datos.nombre} onChange={handleChange} />
                {errors.nombre && <span className="error">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Apellido</label>
                <input type="text" name="apellido" value={datos.apellido} onChange={handleChange} />
                {errors.apellido && <span className="error">{errors.apellido}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Documento</label>
                <input type="text" name="documento" value={datos.documento} onChange={handleChange} />
                {errors.documento && <span className="error">{errors.documento}</span>}
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input type="text" name="telefono" value={datos.telefono} onChange={handleChange} />
                {errors.telefono && <span className="error">{errors.telefono}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Correo</label>
                <input type="email" name="correo" value={datos.correo} onChange={handleChange} />
                {errors.correo && <span className="error">{errors.correo}</span>}
              </div>

              <div className="form-group">
                <label>País</label>
                <input type="text" name="pais" value={datos.pais} onChange={handleChange} />
                {errors.pais && <span className="error">{errors.pais}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Género</label>
                <select name="genero" value={datos.genero} onChange={handleChange}>
                  <option value="">Seleccionar género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.genero && <span className="error">{errors.genero}</span>}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={datos.activo}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Turista Activo
                </label>
              </div>
            </div>

            <div className="botones">
              <button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
              <button type="button" onClick={handleDelete} className="delete-button" disabled={loading}>
                🗑️ Eliminar
              </button>
              <button type="button" onClick={onClose} disabled={loading}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarTuristaForm;
