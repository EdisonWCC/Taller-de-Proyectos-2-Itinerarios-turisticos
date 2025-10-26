import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../../styles/Admin/Itinerario/FormularioDatosItinerario.css';

const FormularioDatosItinerario = forwardRef(({ initialData = {}, grupoSeleccionado = null }, ref) => {
  const [formData, setFormData] = useState({
    fecha_inicio: initialData.fecha_inicio || '',
    fecha_fin: initialData.fecha_fin || '',
    estado_presupuesto_id: initialData.estado_presupuesto_id || 1
  });

  const [errors, setErrors] = useState({});

  // Datos de ejemplo para estados de presupuesto (esto vendría de la API en el futuro)
  const [estadosPresupuesto] = useState([
    { id_estado: 1, nombre_estado: 'En Planificación' },
    { id_estado: 2, nombre_estado: 'Presupuesto Enviado' },
    { id_estado: 3, nombre_estado: 'Presupuesto Aprobado' },
    { id_estado: 4, nombre_estado: 'En Ejecución' },
    { id_estado: 5, nombre_estado: 'Completado' },
    { id_estado: 6, nombre_estado: 'Cancelado' }
  ]);

  // Actualizar el campo grupo cuando cambie el grupoSeleccionado
  useEffect(() => {
    if (grupoSeleccionado) {
      setFormData(prev => ({
        ...prev,
        id_grupo: grupoSeleccionado.id
      }));
    }
  }, [grupoSeleccionado]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha_inicio) {
      newErrors.fecha_inicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fecha_fin) {
      newErrors.fecha_fin = 'La fecha de fin es requerida';
    }

    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      if (inicio >= fin) {
        newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (!formData.estado_presupuesto_id) {
      newErrors.estado_presupuesto_id = 'El estado del presupuesto es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular progreso del formulario
  const getFormProgress = () => {
    const totalFields = 3;
    const completedFields = [
      formData.fecha_inicio,
      formData.fecha_fin,
      formData.estado_presupuesto_id
    ].filter(Boolean).length;

    return Math.round((completedFields / totalFields) * 100);
  };

  // Verificar si el formulario está completo
  const isFormComplete = () => {
    return Object.keys(errors).length === 0 &&
           formData.fecha_inicio &&
           formData.fecha_fin &&
           formData.estado_presupuesto_id;
  };

  // Exponer métodos para el componente padre
  useImperativeHandle(ref, () => ({
    getData: () => ({ ...formData }),
    validate: validateForm,
    isValid: isFormComplete(),
    getProgress: getFormProgress
  }), [formData, errors]);

  return (
    <div className="formulario-datos-container">
      {/* Header del Step */}
      <div className="formulario-datos-header">
        <div className="formulario-datos-step-info">
          <div className="formulario-datos-step-number">2</div>
          <div className="formulario-datos-step-title">
            <h3>Datos del Itinerario</h3>
            <p>Completa la información básica del itinerario</p>
          </div>
        </div>
      </div>

      {/* Contenido del Step */}
      <div className="formulario-datos-content">
        <div className="formulario-datos-step-description">
          <p>En este paso define los datos principales del itinerario según la estructura de la base de datos.</p>
        </div>

        <div className="formulario-datos-form-section">
          {/* Información del Itinerario */}
          <div className="formulario-datos-form-info-card">
            <div className="formulario-datos-form-info-header">
              <div className="formulario-datos-form-info-icon">📅</div>
              <div className="formulario-datos-form-info-text">
                <h4>Información del Itinerario</h4>
                <p>Define las fechas y estado del presupuesto para tu itinerario</p>
              </div>
            </div>
          </div>

          <div className="formulario-datos-form-columns">
            {/* Columna 1 - Fechas */}
            <div className="formulario-datos-form-column">
              <div className="formulario-datos-form-field-wrapper">
                <div className="formulario-datos-form-field-header">
                  <div className="formulario-datos-field-icon">📆</div>
                  <label htmlFor="fecha_inicio" className="formulario-datos-field-label">Fecha de Inicio</label>
                  <span className="formulario-datos-required-indicator">*</span>
                </div>
                <div className="formulario-datos-input-wrapper">
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className={`formulario-datos-form-input ${errors.fecha_inicio ? 'error' : ''} ${formData.fecha_inicio ? 'filled' : ''}`}
                    placeholder="Selecciona la fecha de inicio"
                  />
                  <div className="formulario-datos-input-icon">
                    {formData.fecha_inicio ? '✅' : '📅'}
                  </div>
                </div>
                {errors.fecha_inicio && (
                  <div className="formulario-datos-error-container">
                    <span className="formulario-datos-error-icon">⚠️</span>
                    <span className="formulario-datos-error-message">{errors.fecha_inicio}</span>
                  </div>
                )}
              </div>

              <div className="formulario-datos-form-field-wrapper">
                <div className="formulario-datos-form-field-header">
                  <div className="formulario-datos-field-icon">📊</div>
                  <label htmlFor="estado_presupuesto_id" className="formulario-datos-field-label">Estado del Presupuesto</label>
                  <span className="formulario-datos-required-indicator">*</span>
                </div>
                <div className="formulario-datos-select-wrapper">
                  <select
                    id="estado_presupuesto_id"
                    name="estado_presupuesto_id"
                    value={formData.estado_presupuesto_id}
                    onChange={handleInputChange}
                    className={`formulario-datos-form-select ${errors.estado_presupuesto_id ? 'error' : ''} ${formData.estado_presupuesto_id ? 'filled' : ''}`}
                  >
                    <option value="">Seleccionar estado...</option>
                    {estadosPresupuesto.map(estado => (
                      <option key={estado.id_estado} value={estado.id_estado}>
                        {estado.nombre_estado}
                      </option>
                    ))}
                  </select>
                  <div className="formulario-datos-select-icon">📋</div>
                </div>
                {errors.estado_presupuesto_id && (
                  <div className="formulario-datos-error-container">
                    <span className="formulario-datos-error-icon">⚠️</span>
                    <span className="formulario-datos-error-message">{errors.estado_presupuesto_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Columna 2 - Fechas y Grupo */}
            <div className="formulario-datos-form-column">
              <div className="formulario-datos-form-field-wrapper">
                <div className="formulario-datos-form-field-header">
                  <div className="formulario-datos-field-icon">📆</div>
                  <label htmlFor="fecha_fin" className="formulario-datos-field-label">Fecha de Fin</label>
                  <span className="formulario-datos-required-indicator">*</span>
                </div>
                <div className="formulario-datos-input-wrapper">
                  <input
                    type="date"
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    className={`formulario-datos-form-input ${errors.fecha_fin ? 'error' : ''} ${formData.fecha_fin ? 'filled' : ''}`}
                    placeholder="Selecciona la fecha de fin"
                    min={formData.fecha_inicio || undefined}
                  />
                  <div className="formulario-datos-input-icon">
                    {formData.fecha_fin ? '✅' : '📅'}
                  </div>
                </div>
                {errors.fecha_fin && (
                  <div className="formulario-datos-error-container">
                    <span className="formulario-datos-error-icon">⚠️</span>
                    <span className="formulario-datos-error-message">{errors.fecha_fin}</span>
                  </div>
                )}
              </div>

              <div className="formulario-datos-form-field-wrapper">
                <div className="formulario-datos-form-field-header">
                  <div className="formulario-datos-field-icon">👥</div>
                  <label htmlFor="grupo_asignado" className="formulario-datos-field-label">Grupo Asignado</label>
                  <div className="formulario-datos-field-badge">Auto</div>
                </div>
                <div className="formulario-datos-readonly-wrapper">
                  <input
                    type="text"
                    id="grupo_asignado"
                    name="grupo_asignado"
                    value={grupoSeleccionado ? `${grupoSeleccionado.nombre_grupo} (ID: ${grupoSeleccionado.id})` : 'No asignado'}
                    readOnly
                    className="formulario-datos-form-input formulario-datos-readonly-field"
                    title="Grupo seleccionado en el paso anterior"
                  />
                  <div className="formulario-datos-readonly-icon">
                    {grupoSeleccionado ? '👥' : '❓'}
                  </div>
                </div>
                <small className="formulario-datos-field-hint">
                  <span className="formulario-datos-hint-icon">💡</span>
                  Este campo se asigna automáticamente desde el paso anterior
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Preview de datos mejorado */}
        {(formData.fecha_inicio || formData.fecha_fin || formData.estado_presupuesto_id) && (
          <div className="formulario-datos-preview">
            <div className="formulario-datos-preview-header">
              <div className="formulario-datos-preview-icon">👁️</div>
              <h4>Vista Previa de Datos</h4>
              <div className="formulario-datos-preview-status">
                {isFormComplete() ? (
                  <span className="formulario-datos-status-badge formulario-datos-valid">✅ Completo</span>
                ) : (
                  <span className="formulario-datos-status-badge formulario-datos-pending">⏳ Pendiente</span>
                )}
              </div>
            </div>
            <div className="formulario-datos-preview-card">
              <div className="formulario-datos-preview-grid">
                <div className="formulario-datos-preview-item">
                  <div className="formulario-datos-preview-icon">📅</div>
                  <div className="formulario-datos-preview-content">
                    <div className="formulario-datos-preview-label">Período del Itinerario</div>
                    <div className="formulario-datos-preview-value">
                      {formData.fecha_inicio && formData.fecha_fin
                        ? `${formData.fecha_inicio} al ${formData.fecha_fin}`
                        : 'Fechas no definidas'
                      }
                    </div>
                  </div>
                </div>

                <div className="formulario-datos-preview-item">
                  <div className="formulario-datos-preview-icon">📊</div>
                  <div className="formulario-datos-preview-content">
                    <div className="formulario-datos-preview-label">Estado del Presupuesto</div>
                    <div className="formulario-datos-preview-value">
                      {estadosPresupuesto.find(e => e.id_estado === parseInt(formData.estado_presupuesto_id))?.nombre_estado || 'No seleccionado'}
                    </div>
                  </div>
                </div>

                <div className="formulario-datos-preview-item">
                  <div className="formulario-datos-preview-icon">👥</div>
                  <div className="formulario-datos-preview-content">
                    <div className="formulario-datos-preview-label">Grupo Asignado</div>
                    <div className="formulario-datos-preview-value">
                      {grupoSeleccionado
                        ? `${grupoSeleccionado.nombre_grupo} (ID: ${grupoSeleccionado.id})`
                        : 'No asignado'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen visual del progreso */}
              <div className="formulario-datos-preview-progress">
                <div className="formulario-datos-progress-info">
                  <span className="formulario-datos-progress-text">Completado:</span>
                  <span className="formulario-datos-progress-value">{getFormProgress()}%</span>
                </div>
                <div className="formulario-datos-progress-bar">
                  <div
                    className="formulario-datos-progress-fill"
                    style={{ width: `${getFormProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default FormularioDatosItinerario;