import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../../styles/Admin/Itinerario/TransporteDetalle.css';

const TransporteDetalle = forwardRef(({ initialData = [], itinerarioData = null, programasData = [], onTransportesChange }, ref) => {
  console.log('TransporteDetalle - programasData recibido:', programasData);
  console.log('TransporteDetalle - programasData length:', programasData?.length || 0);
  const [transportesAsignados, setTransportesAsignados] = useState(initialData);
  const [transportesDisponibles, setTransportesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingTransporte, setEditingTransporte] = useState(null);

  // Formulario para nuevo/editar transporte
  const [formData, setFormData] = useState({
    id_itinerario_programa: '',
    id_transporte: '',
    horario_recojo: '',
    lugar_recojo: ''
  });

  // Cargar datos de la API real
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const resp = await fetch('http://localhost:3000/api/transportes');
        const data = await resp.json();
        setTransportesDisponibles(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando transportes:', error);
        setErrors({ general: 'Error al cargar los transportes' });
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      id_itinerario_programa: '',
      id_transporte: '',
      horario_recojo: '',
      lugar_recojo: ''
    });
    setEditingTransporte(null);
    setErrors({});
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_itinerario_programa) {
      newErrors.id_itinerario_programa = 'Debes seleccionar una actividad';
    }

    if (!formData.id_transporte) {
      newErrors.id_transporte = 'Debes seleccionar un transporte';
    }

    if (!formData.horario_recojo) {
      newErrors.horario_recojo = 'La hora de recojo es requerida';
    }

    if (!formData.lugar_recojo.trim()) {
      newErrors.lugar_recojo = 'El lugar de recojo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Obtener nombre del programa por id_itinerario_programa
  const getProgramaInfo = (idItinerarioPrograma) => {
    const target = parseInt(idItinerarioPrograma);
    const programa = programasData.find(p => (p.id_itinerario_programa || p.id) === target);
    if (programa) {
      return {
        nombre: programa.programa_info.nombre,
        fecha: programa.fecha,
        hora_inicio: programa.hora_inicio,
        hora_fin: programa.hora_fin
      };
    }
    return null;
  };

  // Obtener info del transporte por id_transporte
  const getTransporteInfo = (idTransporte) => {
    return transportesDisponibles.find(t => t.id_transporte === parseInt(idTransporte));
  };

  // Asignar transporte
  const handleAssignTransporte = () => {
    if (!validateForm()) return;

    const programaInfo = getProgramaInfo(formData.id_itinerario_programa);
    const transporteInfo = getTransporteInfo(formData.id_transporte);

    if (!programaInfo || !transporteInfo) return;

    const nuevoTransporte = {
      id_detalle_transporte: Date.now(),
      id_itinerario_programa: parseInt(formData.id_itinerario_programa),
      id_transporte: parseInt(formData.id_transporte),
      horario_recojo: formData.horario_recojo,
      lugar_recojo: formData.lugar_recojo.trim(),
      programa_info: programaInfo,
      transporte_info: transporteInfo
    };

    setTransportesAsignados(prev => [...prev, nuevoTransporte]);
    setShowModal(false);
    resetForm();
  };

  // Editar transporte
  const handleEditTransporte = (transporte) => {
    setEditingTransporte(transporte);
    setFormData({
      id_itinerario_programa: transporte.id_itinerario_programa,
      id_transporte: transporte.id_transporte,
      horario_recojo: transporte.horario_recojo,
      lugar_recojo: transporte.lugar_recojo
    });
    setShowModal(true);
  };

  // Actualizar transporte editado
  const handleUpdateTransporte = () => {
    if (!validateForm()) return;

    const programaInfo = getProgramaInfo(formData.id_itinerario_programa);
    const transporteInfo = getTransporteInfo(formData.id_transporte);

    if (!programaInfo || !transporteInfo) return;

    setTransportesAsignados(prev =>
      prev.map(t =>
        t.id_detalle_transporte === editingTransporte.id_detalle_transporte
          ? {
              ...t,
              id_itinerario_programa: parseInt(formData.id_itinerario_programa),
              id_transporte: parseInt(formData.id_transporte),
              horario_recojo: formData.horario_recojo,
              lugar_recojo: formData.lugar_recojo.trim(),
              programa_info: programaInfo,
              transporte_info: transporteInfo
            }
          : t
      )
    );

    setShowModal(false);
    resetForm();
  };

  // Eliminar transporte
  const handleRemoveTransporte = (idTransporte) => {
    setTransportesAsignados(prev => prev.filter(t => t.id_detalle_transporte !== idTransporte));
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

  // Manejar apertura del modal
  const handleOpenModal = () => {
    console.log('Abriendo modal de transporte...');
    console.log('Datos disponibles:', {
      programasData: programasData,
      transportesDisponibles: transportesDisponibles
    });

    // Validar que hay programas disponibles
    if (!programasData || programasData.length === 0) {
      alert('⚠️ No hay actividades programadas. Debes completar el paso de "Programas y Actividades" antes de asignar transportes.');
      return;
    }

    // Validar que hay transportes disponibles
    if (!transportesDisponibles || transportesDisponibles.length === 0) {
      alert('⚠️ No hay transportes disponibles. Contacta al administrador del sistema.');
      return;
    }

    // Agregar un pequeño delay para feedback visual
    setTimeout(() => {
      setShowModal(true);
    }, 100);
  };

  // Cerrar modal al hacer clic fuera
  const handleCloseModal = () => {
    console.log('Cerrando modal de transporte...');
    setShowModal(false);
    resetForm();
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    getData: () => transportesAsignados,
    validate: () => true, // Los transportes son opcionales
    isValid: () => true
  }));

  // Notificar al padre cuando cambie la lista local
  useEffect(() => {
    if (typeof onTransportesChange === 'function') {
      onTransportesChange(transportesAsignados);
    }
  }, [transportesAsignados]);

  return (
    <div className="transporte-detalle-container">
      <div className="transporte-detalle-header expanded transporte">
        <div className="transporte-detalle-info">
          <div className="transporte-detalle-number">5</div>
          <div className="transporte-detalle-title">
            <h3>🚌 Detalle de Transporte</h3>
            <p>Asigna transporte para las actividades del itinerario</p>
          </div>
        </div>
      </div>

      <div className="transporte-detalle-content">
        <div className="transporte-detalle-description">
          <p>Asigna transporte específico para cada actividad del itinerario que lo requiera.</p>
          {itinerarioData && (
            <div className="transporte-detalle-info-card">
              <strong>Actividades disponibles:</strong> {programasData?.length || 0} programas programados
              <br />
              <strong>Transportes disponibles:</strong> {transportesDisponibles?.length || 0} opciones
              {(!programasData || programasData.length === 0) && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  ⚠️ Debes completar el paso de "Programas y Actividades" antes de asignar transportes.
                </div>
              )}
            </div>
          )}
        </div>

        {errors.general && (
          <div className="transporte-detalle-error-message">
            {errors.general}
          </div>
        )}

        {loading && (
          <div className="transporte-detalle-loading-state">
            <p>Cargando transportes disponibles...</p>
          </div>
        )}

        {/* Tabla de transportes asignados */}
        <div className="transporte-detalle-asignados">
          <div className="transporte-detalle-actions">
            <button
              className="btn btn-primary"
              onClick={handleOpenModal}
            >
              ➕ Asignar Transporte
            </button>
          </div>

          <h4>📋 Transportes Asignados ({transportesAsignados.length})</h4>

          {transportesAsignados.length === 0 ? (
            <div className="transporte-detalle-empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚌</div>
              <p>No hay transportes asignados.</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Asigna transportes específicos para las actividades del itinerario
              </p>
              <button
                className="btn btn-primary"
                onClick={handleOpenModal}
              >
                ➕ Asignar Primer Transporte
              </button>
            </div>
          ) : (
            <div className="transporte-detalle-table-container">
              <table className="transporte-detalle-data-table">
                <thead>
                  <tr>
                    <th>Programa/Actividad</th>
                    <th>Transporte</th>
                    <th>Hora de Recojo</th>
                    <th>Lugar de Recojo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transportesAsignados.map(transporte => (
                    <tr key={transporte.id_detalle_transporte}>
                      <td>
                        <div className="transporte-detalle-programa-info">
                          <strong>{transporte.programa_info?.nombre || 'Programa no disponible'}</strong>
                          <small>📅 {transporte.programa_info?.fecha || 'Sin fecha'}</small>
                          <small>🕐 {transporte.programa_info?.hora_inicio || '--:--'} - {transporte.programa_info?.hora_fin || '--:--'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="transporte-detalle-transporte-info">
                          <strong>{transporte.transporte_info?.empresa || 'Sin empresa'}</strong>
                          <small>🚗 {transporte.transporte_info?.tipo || 'Sin tipo'} (Cap: {transporte.transporte_info?.capacidad || '--'})</small>
                        </div>
                      </td>
                      <td>{transporte.horario_recojo}</td>
                      <td>{transporte.lugar_recojo}</td>
                      <td>
                        <div className="transporte-detalle-table-actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEditTransporte(transporte)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveTransporte(transporte.id_detalle_transporte)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar/editar transporte */}
      {showModal && (
        <div className="transporte-detalle-modal-overlay" onClick={handleCloseModal}>
          <div className="transporte-detalle-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="transporte-detalle-modal-header">
              <h3>
                {editingTransporte ? '✏️ Editar Transporte' : '➕ Asignar Transporte'}
              </h3>
              <button
                className="transporte-detalle-modal-close"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>

            <div className="transporte-detalle-modal-body">
              <div className="transporte-detalle-form-row">
                <div className="transporte-detalle-form-group">
                  <label>Actividad/Programa *</label>
                  <select
                    name="id_itinerario_programa"
                    value={String(formData.id_itinerario_programa || '')}
                    onChange={handleInputChange}
                    className={errors.id_itinerario_programa ? 'error' : ''}
                  >
                    <option value="">Seleccionar actividad...</option>
                    {programasData.map((programa, idx) => {
                      const pid = programa.id_itinerario_programa || programa.id;
                      return (
                        <option key={pid || idx} value={String(pid)}>
                          {programa.programa_info.nombre} - {programa.fecha}
                        </option>
                      );
                    })}
                  </select>
                  {errors.id_itinerario_programa && <span className="error-message">{errors.id_itinerario_programa}</span>}
                </div>

                <div className="transporte-detalle-form-group">
                  <label>Transporte *</label>
                  <select
                    name="id_transporte"
                    value={formData.id_transporte}
                    onChange={handleInputChange}
                    className={errors.id_transporte ? 'error' : ''}
                  >
                    <option value="">Seleccionar transporte...</option>
                    {transportesDisponibles.map((transporte, idx) => (
                      <option key={transporte.id_transporte || idx} value={transporte.id_transporte}>
                        {transporte.empresa} ({transporte.tipo} - Cap: {transporte.capacidad})
                      </option>
                    ))}
                  </select>
                  {errors.id_transporte && <span className="error-message">{errors.id_transporte}</span>}
                </div>
              </div>

              <div className="transporte-detalle-form-row">
                <div className="transporte-detalle-form-group">
                  <label>Hora de Recojo *</label>
                  <input
                    type="time"
                    name="horario_recojo"
                    value={formData.horario_recojo}
                    onChange={handleInputChange}
                    className={errors.horario_recojo ? 'error' : ''}
                  />
                  {errors.horario_recojo && <span className="error-message">{errors.horario_recojo}</span>}
                </div>

                <div className="transporte-detalle-form-group">
                  <label>Lugar de Recojo *</label>
                  <input
                    type="text"
                    name="lugar_recojo"
                    value={formData.lugar_recojo}
                    onChange={handleInputChange}
                    placeholder="Ej: Hotel Plaza, Av. Principal 123"
                    maxLength="150"
                    className={errors.lugar_recojo ? 'error' : ''}
                  />
                  {errors.lugar_recojo && <span className="error-message">{errors.lugar_recojo}</span>}
                </div>
              </div>

              {/* Vista previa */}
              {formData.id_itinerario_programa && formData.id_transporte && (
                <div className="transporte-detalle-preview">
                  <h5 className="transporte-detalle-preview-title">📋 Vista Previa</h5>
                  <div className="transporte-detalle-preview-card">
                    <div className="transporte-detalle-preview-item">
                      <strong>Actividad:</strong> {getProgramaInfo(formData.id_itinerario_programa)?.nombre}
                    </div>
                    <div className="transporte-detalle-preview-item">
                      <strong>Transporte:</strong> {getTransporteInfo(formData.id_transporte)?.empresa}
                    </div>
                    <div className="transporte-detalle-preview-item">
                      <strong>Horario:</strong> {formData.horario_recojo}
                    </div>
                    <div className="transporte-detalle-preview-item">
                      <strong>Lugar:</strong> {formData.lugar_recojo}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="transporte-detalle-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={editingTransporte ? handleUpdateTransporte : handleAssignTransporte}
              >
                {editingTransporte ? '✅ Actualizar' : '✅ Asignar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TransporteDetalle;
