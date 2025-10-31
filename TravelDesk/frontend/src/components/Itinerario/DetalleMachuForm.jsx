import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../../styles/Admin/Itinerario/DetalleMachuForm.css';

const DetalleMachuForm = forwardRef(({ 
  initialData = [], 
  programasData = [], 
  onDetallesChange,
  isReadOnly = false,
  showEmptyState = false
}, ref) => {
  const [detallesMachu, setDetallesMachu] = useState(initialData);
  const [errors, setErrors] = useState({});

  // Formulario para detalle Machu Picchu
  const [formData, setFormData] = useState({
    id_itinerario_programa: '',
    empresa_tren: '',
    horario_tren_ida: '',
    horario_tren_retor: '',
    nombre_guia: '',
    ruta: '',
    tiempo_visita: ''
  });

  // Verificar si hay programas de tipo machupicchu (con búsqueda flexible)
  const hasMachuPicchuPrograms = programasData.some(programa =>
    programa.programa_info?.tipo?.toLowerCase().includes('machu') ||
    programa.programa_info?.nombre?.toLowerCase().includes('machu')
  );

  // Obtener programas de Machu Picchu disponibles (con búsqueda flexible)
  const machuPicchuPrograms = programasData.filter(programa =>
    programa.programa_info?.tipo?.toLowerCase().includes('machu') ||
    programa.programa_info?.nombre?.toLowerCase().includes('machu')
  );

  // Notificar al padre de los cambios en los detalles
  useEffect(() => {
    if (onDetallesChange) {
      onDetallesChange(detallesMachu);
    }
  }, [detallesMachu, onDetallesChange]);

 
  // Reset form
  const resetForm = () => {
    setFormData({
      id_itinerario_programa: '',
      empresa_tren: '',
      horario_tren_ida: '',
      horario_tren_retor: '',
      nombre_guia: '',
      ruta: '',
      tiempo_visita: ''
    });
    setErrors({});
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_itinerario_programa) {
      newErrors.id_itinerario_programa = 'Debes seleccionar un programa de Machu Picchu';
    }

    if (!formData.empresa_tren.trim()) {
      newErrors.empresa_tren = 'La empresa de tren es requerida';
    }

    if (!formData.horario_tren_ida) {
      newErrors.horario_tren_ida = 'El horario de ida es requerido';
    }

    if (!formData.horario_tren_retor) {
      newErrors.horario_tren_retor = 'El horario de retorno es requerido';
    }

    if (formData.horario_tren_ida && formData.horario_tren_retor) {
      if (formData.horario_tren_ida >= formData.horario_tren_retor) {
        newErrors.horario_tren_retor = 'El horario de retorno debe ser posterior al de ida';
      }
    }

    if (!formData.nombre_guia.trim()) {
      newErrors.nombre_guia = 'El nombre del guía es requerido';
    }

    if (!formData.ruta.trim()) {
      newErrors.ruta = 'La ruta es requerida';
    }

    if (!formData.tiempo_visita.trim()) {
      newErrors.tiempo_visita = 'El tiempo estimado de visita es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar detalle Machu Picchu
  const handleSaveDetalle = () => {
    if (!validateForm()) return;

    const programaInfo = machuPicchuPrograms.find(p =>
      p.id_itinerario_programa === parseInt(formData.id_itinerario_programa)
    );

    if (!programaInfo) return;

    const nuevoDetalle = {
      id_itinerario_programa: parseInt(formData.id_itinerario_programa),
      empresa_tren: formData.empresa_tren.trim(),
      horario_tren_ida: formData.horario_tren_ida,
      horario_tren_retor: formData.horario_tren_retor,
      nombre_guia: formData.nombre_guia.trim(),
      ruta: formData.ruta.trim(),
      tiempo_visita: formData.tiempo_visita.trim(),
      programa_info: programaInfo.programa_info
    };

    // Verificar si ya existe un detalle para este programa
    const existingIndex = detallesMachu.findIndex(d =>
      d.id_itinerario_programa === parseInt(formData.id_itinerario_programa)
    );

    if (existingIndex >= 0) {
      // Actualizar detalle existente
      setDetallesMachu(prev =>
        prev.map((detalle, index) =>
          index === existingIndex ? nuevoDetalle : detalle
        )
      );
    } else {
      // Agregar nuevo detalle
      setDetallesMachu(prev => [...prev, nuevoDetalle]);
    }

    resetForm();
  };

  // Eliminar detalle
  const handleRemoveDetalle = (idItinerarioPrograma) => {
    setDetallesMachu(prev =>
      prev.filter(detalle => detalle.id_itinerario_programa !== idItinerarioPrograma)
    );
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    getData: () => detallesMachu,
    validate: () => true, // Los detalles de Machu Picchu son opcionales
    isValid: () => true
  }));

  return (
    <div className="detalle-machu-container">
      <div className="detalle-machu-header expanded machu">
        <div className="detalle-machu-info">
          <div className="detalle-machu-number">6</div>
          <div className="detalle-machu-title">
            <h3>🏔️ Detalle Machu Picchu</h3>
            <p>Configura los detalles específicos para programas de Machu Picchu</p>
          </div>
        </div>
      </div>

      <div className="detalle-machu-step-content">
        <div className="detalle-machu-step-description">
          <p>Completa la información específica para las visitas a Machu Picchu en tu itinerario.</p>
          {showEmptyState && !hasMachuPicchuPrograms ? (
            <div className="detalle-machu-empty-state">
              <div className="detalle-machu-empty-state-icon">🏔️</div>
              <h4>No hay programas de Machu Picchu configurados</h4>
              <p>Puedes agregar un programa de Machu Picchu en el paso de "Programas" o configurar los detalles manualmente aquí.</p>
            </div>
          ) : (
            <div className="detalle-machu-machu-programs-info">
              <strong>📋 Programas de Machu Picchu detectados:</strong> {machuPicchuPrograms.length}
              {machuPicchuPrograms.length > 0 && (
                <div className="detalle-machu-programs-list">
                  {machuPicchuPrograms.map(programa => (
                    <div key={programa.id_itinerario_programa} className="detalle-machu-program-chip">
                      {programa.programa_info?.nombre} - {programa.fecha}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Layout de 2 columnas */}
        <div className="detalle-machu-two-column-layout">
          {/* Columna 1: Formulario */}
          <div className="detalle-machu-form-column-wrapper">
            <div className="detalle-machu-machu-form-container">
              <div className="detalle-machu-form-section">
                <div className="detalle-machu-form-columns">
                  {/* Columna 1: Información del tren */}
                  <div className="detalle-machu-form-column">
                    <h4>🚆 Información del Tren</h4>

                    <div className="detalle-machu-form-group">
                      <label>Programa de Machu Picchu *</label>
                      <select
                        name="id_itinerario_programa"
                        value={formData.id_itinerario_programa}
                        onChange={handleInputChange}
                        className={errors.id_itinerario_programa ? 'detalle-machu-error' : ''}
                      >
                        <option value="">Seleccionar programa...</option>
                        {machuPicchuPrograms.map(programa => (
                          <option key={programa.id_itinerario_programa} value={programa.id_itinerario_programa}>
                            {programa.programa_info.nombre} - {programa.fecha} ({programa.hora_inicio}-{programa.hora_fin})
                          </option>
                        ))}
                      </select>
                      {errors.id_itinerario_programa && <span className="detalle-machu-error-message">{errors.id_itinerario_programa}</span>}
                    </div>

                    <div className="detalle-machu-form-group">
                      <label>Empresa de Tren *</label>
                      <input
                        type="text"
                        name="empresa_tren"
                        value={formData.empresa_tren}
                        onChange={handleInputChange}
                        placeholder="Ej: Peru Rail, Inca Rail"
                        maxLength="100"
                        className={errors.empresa_tren ? 'detalle-machu-error' : ''}
                      />
                      {errors.empresa_tren && <span className="detalle-machu-error-message">{errors.empresa_tren}</span>}
                    </div>

                    <div className="detalle-machu-form-group">
                      <label>Horario de Tren Ida *</label>
                      <input
                        type="time"
                        name="horario_tren_ida"
                        value={formData.horario_tren_ida}
                        onChange={handleInputChange}
                        className={errors.horario_tren_ida ? 'detalle-machu-error' : ''}
                      />
                      {errors.horario_tren_ida && <span className="detalle-machu-error-message">{errors.horario_tren_ida}</span>}
                    </div>

                    <div className="detalle-machu-form-group">
                      <label>Horario de Tren Retorno *</label>
                      <input
                        type="time"
                        name="horario_tren_retor"
                        value={formData.horario_tren_retor}
                        onChange={handleInputChange}
                        className={errors.horario_tren_retor ? 'detalle-machu-error' : ''}
                      />
                      {errors.horario_tren_retor && <span className="detalle-machu-error-message">{errors.horario_tren_retor}</span>}
                    </div>
                  </div>

                  {/* Columna 2: Información del guía y visita */}
                  <div className="detalle-machu-form-column">
                    <h4>👨‍🏫 Información del Guía y Visita</h4>

                    <div className="detalle-machu-form-group">
                      <label>Nombre del Guía *</label>
                      <input
                        type="text"
                        name="nombre_guia"
                        value={formData.nombre_guia}
                        onChange={handleInputChange}
                        placeholder="Ej: Juan Pérez"
                        maxLength="100"
                        className={errors.nombre_guia ? 'detalle-machu-error' : ''}
                      />
                      {errors.nombre_guia && <span className="detalle-machu-error-message">{errors.nombre_guia}</span>}
                    </div>

                    <div className="detalle-machu-form-group">
                      <label>Ruta *</label>
                      <input
                        type="text"
                        name="ruta"
                        value={formData.ruta}
                        onChange={handleInputChange}
                        placeholder="Ej: Ruta 1, Ruta 2"
                        maxLength="10"
                        className={errors.ruta ? 'detalle-machu-error' : ''}
                      />
                      {errors.ruta && <span className="detalle-machu-error-message">{errors.ruta}</span>}
                    </div>

                    <div className="detalle-machu-form-group">
                      <label>Tiempo Estimado de Visita *</label>
                      <input
                        type="text"
                        name="tiempo_visita"
                        value={formData.tiempo_visita}
                        onChange={handleInputChange}
                        placeholder="Ej: 3 horas, 4 horas"
                        maxLength="50"
                        className={errors.tiempo_visita ? 'detalle-machu-error' : ''}
                      />
                      {errors.tiempo_visita && <span className="detalle-machu-error-message">{errors.tiempo_visita}</span>}
                    </div>
                  </div>
                </div>

                {/* Botón de guardar */}
                <div className="detalle-machu-form-actions">
                  <button
                    className="detalle-machu-btn detalle-machu-btn-primary"
                    onClick={handleSaveDetalle}
                    disabled={!formData.id_itinerario_programa}
                  >
                    💾 Guardar Detalle Machu Picchu
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Detalles guardados */}
          <div className="detalle-machu-details-column-wrapper">
            <div className="detalle-machu-detalles-guardados">
              <h4>📋 Detalles Guardados ({detallesMachu.length})</h4>

              {detallesMachu.length === 0 ? (
                <div className="detalle-machu-empty-state">
                  <p>No hay detalles de Machu Picchu guardados.</p>
                  {!hasMachuPicchuPrograms ? (
                    <p className="detalle-machu-empty-state-subtitle">
                      Agrega un programa de Machu Picchu en el paso de "Programas" o completa el formulario manualmente.
                    </p>
                  ) : (
                    <p className="detalle-machu-empty-state-subtitle">
                      Completa el formulario para agregar información específica de Machu Picchu.
                    </p>
                  )}
                </div>
              ) : (
                <div className="detalle-machu-detalles-list">
                  {detallesMachu.map(detalle => {
                    // Buscar el programa correspondiente para mostrar su información
                    const programa = programasData.find(p => p.id === detalle.id_itinerario_programa);
                    return (
                      <div key={detalle.id_itinerario_programa} className="detalle-machu-detalle-item">
                        <div className="detalle-machu-detalle-header">
                          <h5>{programa?.programa_info?.nombre || 'Programa sin nombre'}</h5>
                          <span className="detalle-machu-detalle-date">{programa?.fecha || 'Sin fecha'}</span>
                        </div>
                        <div className="detalle-machu-detalle-content">
                          <div className="detalle-machu-detalle-row">
                            <span className="detalle-machu-detalle-label">🚆 Empresa de Tren:</span>
                            <span className="detalle-machu-detalle-value">{detalle.empresa_tren}</span>
                          </div>
                          <div className="detalle-machu-detalle-row">
                            <span className="detalle-machu-detalle-label">🕐 Horarios:</span>
                            <span className="detalle-machu-detalle-value">
                              Ida: {detalle.horario_tren_ida} | Retorno: {detalle.horario_tren_retor}
                            </span>
                          </div>
                          <div className="detalle-machu-detalle-row">
                            <span className="detalle-machu-detalle-label">👨‍🏫 Guía:</span>
                            <span className="detalle-machu-detalle-value">{detalle.nombre_guia}</span>
                          </div>
                          <div className="detalle-machu-detalle-row">
                            <span className="detalle-machu-detalle-label">🗺️ Ruta:</span>
                            <span className="detalle-machu-detalle-value">{detalle.ruta}</span>
                          </div>
                          <div className="detalle-machu-detalle-row">
                            <span className="detalle-machu-detalle-label">⏱️ Tiempo de Visita:</span>
                            <span className="detalle-machu-detalle-value">{detalle.tiempo_visita}</span>
                          </div>
                        </div>
                        <div className="detalle-machu-detalle-actions">
                          <button
                            className="detalle-machu-btn detalle-machu-btn-danger detalle-machu-btn-sm"
                            onClick={() => handleRemoveDetalle(detalle.id_itinerario_programa)}
                            title="Eliminar detalle"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DetalleMachuForm;
