import React from 'react'
import '../../format/admin.css'
import useTuristForm from '../../logic/useTuristForm'

export default function FormularioTurista() {
  const { values, errors, submitting, submitted, handleChange, handleSubmit } = useTuristForm()

  return (
    <form onSubmit={handleSubmit} className="admin-card">
      <h3 style={{ marginTop: 0 }}>Registro de Turistas</h3>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre"
            required
          />
          {errors.nombre && <div className="form-error">{errors.nombre}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            name="apellido"
            value={values.apellido}
            onChange={handleChange}
            placeholder="Ingresa el apellido"
            required
          />
          {errors.apellido && <div className="form-error">{errors.apellido}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="dni">DNI</label>
          <input
            id="dni"
            name="dni"
            value={values.dni}
            onChange={handleChange}
            placeholder="Ingresa el DNI"
            required
          />
          {errors.dni && <div className="form-error">{errors.dni}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="pasaporte">Pasaporte</label>
          <input
            id="pasaporte"
            name="pasaporte"
            value={values.pasaporte}
            onChange={handleChange}
            placeholder="Ingresa el pasaporte"
            required
          />
          {errors.pasaporte && <div className="form-error">{errors.pasaporte}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="nacionalidad">Nacionalidad</label>
          <input
            id="nacionalidad"
            name="nacionalidad"
            value={values.nacionalidad}
            onChange={handleChange}
            placeholder="Ej. Peruana"
            required
          />
          {errors.nacionalidad && <div className="form-error">{errors.nacionalidad}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={values.fecha_nacimiento}
            onChange={handleChange}
            required
          />
          {errors.fecha_nacimiento && <div className="form-error">{errors.fecha_nacimiento}</div>}
        </div>

        <div className="form-field">
          <label htmlFor="genero">Género</label>
          <select id="genero" name="genero" value={values.genero} onChange={handleChange} required>
            <option value="">Selecciona</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.genero && <div className="form-error">{errors.genero}</div>}
        </div>
      </div>

      {/* Documento combinado eliminado porque ahora ambos son obligatorios */}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        {submitted && <span className="form-success">Guardado correctamente</span>}
      </div>
    </form>
  )
}
