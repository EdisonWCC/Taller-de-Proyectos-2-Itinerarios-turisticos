import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import '../../styles/Admin/Itinerario/ItinerarioProgramasSelector.css';

const ItinerarioProgramasSelector = forwardRef(({ onNext, onBack, initialData = [], itinerarioData = null, onProgramasChange, isReadOnly = false }, ref) => {
  console.log('ItinerarioProgramasSelector - props recibidas:', { onNext: !!onNext, onBack: !!onBack, initialData, itinerarioData, onProgramasChange: !!onProgramasChange });
  const [programasSeleccionados, setProgramasSeleccionados] = useState(initialData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProgramaId, setEditingProgramaId] = useState(null);
  const [errors, setErrors] = useState({});

  // Programas vendrán de la API real - por ahora estado vacío
  const [programasDisponibles, setProgramasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Solo los 3 tipos reales de la BD
  const tiposPrograma = [
    'tour',
    'actividad',
    'machupicchu'
  ];

  // Sincronizar con datos iniciales del componente padre (solo si local está vacío)
  useEffect(() => {
    console.log('ItinerarioProgramasSelector - initialData recibido:', initialData);
    if (programasSeleccionados.length === 0 && Array.isArray(initialData) && initialData.length > 0) {
      setProgramasSeleccionados(initialData);
    }
  }, [initialData]);

  // Cargar programas de la API real
  useEffect(() => {
    const loadProgramas = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/programas');
        const data = await response.json();
        setProgramasDisponibles(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando programas:', error);
        setErrors({ general: 'Error al cargar los programas' });
        setLoading(false);
      }
    };

    loadProgramas();
  }, []);

  // Formulario simple con campos reales de la BD
  const [nuevoProgramaForm, setNuevoProgramaForm] = useState({
    id: '',
    id_programa: '',
    nombre: '',
    descripcion: '',
    tipo: '',
    duracion: '',
    costo: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: ''
  });
  
  // Inicializar el formulario con valores vacíos
  const resetForm = () => {
    setNuevoProgramaForm({
      id: '',
      id_programa: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      duracion: '',
      costo: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: ''
    });
    setEditingProgramaId(null);
  };

  // Validar fecha dentro del rango
  const isFechaValida = (fecha) => {
    if (!itinerarioData?.fecha_inicio || !itinerarioData?.fecha_fin) return true;
    const fechaSeleccionada = new Date(fecha);
    const fechaInicio = new Date(itinerarioData.fecha_inicio);
    const fechaFin = new Date(itinerarioData.fecha_fin);
    return fechaSeleccionada >= fechaInicio && fechaSeleccionada <= fechaFin;
  };

  const handleAddPrograma = () => {
    const errors = {};

    // Solo campos reales de la BD
    if (!nuevoProgramaForm.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!nuevoProgramaForm.tipo) {
      errors.tipo = 'Selecciona el tipo';
    }

    if (!nuevoProgramaForm.duracion || parseFloat(nuevoProgramaForm.duracion) <= 0) {
      errors.duracion = 'La duración debe ser mayor a 0';
    }

    if (!nuevoProgramaForm.costo || parseFloat(nuevoProgramaForm.costo) <= 0) {
      errors.costo = 'El costo debe ser mayor a 0';
    }

    if (!nuevoProgramaForm.fecha) {
      errors.fecha = 'La fecha es requerida';
    } else if (!isFechaValida(nuevoProgramaForm.fecha)) {
      errors.fecha = `Fecha fuera del rango del itinerario`;
    }

    if (!nuevoProgramaForm.hora_inicio) {
      errors.hora_inicio = 'Hora de inicio requerida';
    }

    if (!nuevoProgramaForm.hora_fin) {
      errors.hora_fin = 'Hora de fin requerida';
    }

    if (nuevoProgramaForm.hora_inicio && nuevoProgramaForm.hora_fin) {
      if (nuevoProgramaForm.hora_inicio >= nuevoProgramaForm.hora_fin) {
        errors.hora_fin = 'Hora de fin debe ser posterior';
      }
    }

    console.log('ItinerarioProgramasSelector - errores encontrados:', errors);

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      console.log('ItinerarioProgramasSelector - Validación falló, no se agregará el programa');
      return;
    }

    // Verificar conflictos de horarios
    const conflicto = programasSeleccionados.find(p =>
      p.fecha === nuevoProgramaForm.fecha &&
      ((nuevoProgramaForm.hora_inicio >= p.hora_inicio && nuevoProgramaForm.hora_inicio < p.hora_fin) ||
       (nuevoProgramaForm.hora_fin > p.hora_inicio && nuevoProgramaForm.hora_fin <= p.hora_fin))
    );

    console.log('ItinerarioProgramasSelector - conflicto de horarios:', conflicto);

    if (conflicto) {
      setErrors({ general: 'Conflicto de horarios en esa fecha' });
      console.log('ItinerarioProgramasSelector - Conflicto de horarios detectado');
      return;
    }

    console.log('ItinerarioProgramasSelector - Agregando programa de tipo:', nuevoProgramaForm.tipo);

    // Crear el objeto programa_info basado en los datos del formulario
    const programa = {
      id_programa: Date.now() + Math.random(),
      nombre: nuevoProgramaForm.nombre,
      descripcion: nuevoProgramaForm.descripcion,
      tipo: nuevoProgramaForm.tipo,
      duracion: parseInt(nuevoProgramaForm.duracion),
      costo: parseFloat(nuevoProgramaForm.costo)
    };

    console.log('ItinerarioProgramasSelector - Programa creado:', programa);

    const nuevoProgramaItinerario = {
      id_itinerario_programa: Date.now() + 1,
      id_itinerario: itinerarioData?.id_itinerario || 1,
      id_programa: programa.id_programa,
      fecha: nuevoProgramaForm.fecha,
      hora_inicio: nuevoProgramaForm.hora_inicio,
      hora_fin: nuevoProgramaForm.hora_fin,
      programa_info: programa
    };

    console.log('ItinerarioProgramasSelector - nuevoProgramaItinerario:', nuevoProgramaItinerario);

    const nuevosProgramas = [...programasSeleccionados, nuevoProgramaItinerario];
    setProgramasSeleccionados(nuevosProgramas);

    console.log('ItinerarioProgramasSelector - nuevosProgramas:', nuevosProgramas);

    // La notificación al padre se realiza en el useEffect que observa programasSeleccionados

    setShowAddModal(false);
    setNuevoProgramaForm({
      id_programa: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      duracion: '',
      costo: '',
      fecha: '',
      hora_inicio: '',
      hora_fin: ''
    });
    setErrors({});
    console.log('ItinerarioProgramasSelector - Modal cerrado y formulario reseteado');
  };

  const handleEditPrograma = (programa) => {
    setNuevoProgramaForm({
      id: programa.id,
      id_programa: programa.programa_info.id,
      nombre: programa.programa_info.nombre,
      descripcion: programa.programa_info.descripcion || '',
      tipo: programa.programa_info.tipo,
      duracion: programa.programa_info.duracion,
      costo: programa.programa_info.costo,
      fecha: programa.fecha,
      hora_inicio: programa.hora_inicio,
      hora_fin: programa.hora_fin
    });
    setEditingProgramaId(programa.id);
    setShowAddModal(true);
  };

  const handleRemovePrograma = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este programa?')) {
      setProgramasSeleccionados(prev => {
        const updated = prev.filter(programa => programa.id !== id);
        if (onProgramasChange) onProgramasChange(updated);
        return updated;
      });
    }
  };

  // Validación para navegación
  const validate = () => {
    if (programasSeleccionados.length === 0) {
      setErrors({ general: 'Selecciona al menos un programa antes de continuar' });
      return false;
    }

    // Validación más flexible: permite continuar con 1 o más programas
    if (programasSeleccionados.length >= 1) {
      setErrors({});
      return true;
    }

    setErrors({});
    return true;
  };

  // Estados del componente - simplificado sin auto-navegación
  const [emptyStateStatus, setEmptyStateStatus] = useState('empty'); // empty, loading, complete
  const [completionProgress, setCompletionProgress] = useState({ current: 0, required: 3, percentage: 0 });

  // Calcular el progreso de completado
  useEffect(() => {
    const requiredPrograms = 3; // Meta recomendada de programas
    const currentPrograms = programasSeleccionados.length;
    const percentage = Math.min((currentPrograms / requiredPrograms) * 100, 100);

    setCompletionProgress({
      current: currentPrograms,
      required: requiredPrograms,
      percentage: percentage
    });

    // Determinar el estado del empty state - sin auto-navegación
    if (currentPrograms === 0) {
      setEmptyStateStatus('empty');
    } else {
      // Cambiar a estado completo cuando hay programas
      setEmptyStateStatus('complete');
    }

    // Notificar al padre que los programas han cambiado
    if (onProgramasChange) {
      onProgramasChange(programasSeleccionados);
    }
  }, [programasSeleccionados]);

  // Exponer métodos para el componente padre
  useImperativeHandle(ref, () => ({
    getData: () => programasSeleccionados,
    validate: validate,
    isValid: programasSeleccionados.length > 0,
    getProgramas: () => programasSeleccionados,
    addPrograma: (programa) => {
      const nuevoProgramaItinerario = {
        id_itinerario_programa: Date.now() + Math.random(),
        id_itinerario: itinerarioData?.id_itinerario || 1,
        id_programa: programa.id_programa || Date.now(),
        fecha: programa.fecha,
        hora_inicio: programa.hora_inicio,
        hora_fin: programa.hora_fin,
        programa_info: programa
      };
      const nuevosProgramas = [...programasSeleccionados, nuevoProgramaItinerario];
      setProgramasSeleccionados(nuevosProgramas);

      // Notificar al padre
      if (onProgramasChange) {
        onProgramasChange(nuevosProgramas);
      }
    }
  }), [programasSeleccionados, itinerarioData, onProgramasChange]);

  const costoTotal = programasSeleccionados.reduce((total, p) => total + (parseFloat(p.programa_info.costo) || 0), 0);

  console.log('ItinerarioProgramasSelector - programasSeleccionados:', programasSeleccionados);
  console.log('ItinerarioProgramasSelector - emptyStateStatus:', emptyStateStatus);

  return (
    <div className="programas-selector-container">
      <div className="programas-selector-header">
        <div className="programas-selector-info">
          <div className="programas-selector-number">4</div>
          <div className="programas-selector-title">
            <h3>🎯 Programas y Actividades</h3>
            <p>Selecciona y programa las actividades del itinerario</p>
          </div>
        </div>
      </div>

      <div className="programas-selector-content">
        <div className="programas-selector-description">
          <p>Selecciona los programas y actividades que formarán parte de este itinerario.</p>
          {itinerarioData && (
            <div className="programas-selector-itinerario-info">
              <strong>Rango:</strong> {itinerarioData.fecha_inicio} al {itinerarioData.fecha_fin}
            </div>
          )}
        </div>

        {errors.general && (
          <div className="programas-selector-error-message">
            {errors.general}
          </div>
        )}

        {loading && (
          <div className="programas-selector-loading-state">
            <p>Cargando programas...</p>
          </div>
        )}

        <div className="programas-selector-seleccionados">
          <div className="programas-selector-section-header">
            <h4>📋 Programas Seleccionados ({programasSeleccionados.length})</h4>

            {/* Solo botón de agregar programa */}
            <button
              className="programas-selector-btn programas-selector-btn-primary programas-selector-btn-add"
              onClick={() => setShowAddModal(true)}
            >
              ➕ Agregar Programa
            </button>
          </div>

          {programasSeleccionados.length === 0 ? (
            <div className={`programas-selector-empty-state ${emptyStateStatus}`}>
              <div className="empty-state-icon">
                📋
              </div>
              <div className="empty-state-title">
                No hay programas seleccionados
              </div>
              <div className="empty-state-description">
                Comienza agregando programas y actividades para tu itinerario. Puedes agregar tantos como necesites.
              </div>

              <div className="empty-state-hint">
                Crea todos los programas que necesites para tu itinerario
              </div>

              <div className="empty-state-actions">
                <button
                  className="programas-selector-btn programas-selector-btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  ➕ Crear Programa
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="programas-selector-list">
                {programasSeleccionados.map((item, idx) => (
                  <div key={item.id_itinerario_programa || item.id || idx} className="programas-selector-item">
                    <div className="programas-selector-info">
                      <div className="programas-selector-header">
                        <h5>{item.programa_info.nombre}</h5>
                        <span className={`programas-selector-tipo-badge programas-selector-tipo-${item.programa_info.tipo}`}>
                          {item.programa_info.tipo}
                        </span>
                      </div>
                      <p className="programas-selector-descripcion">{item.programa_info.descripcion}</p>
                      <div className="programas-selector-details">
                        <span className="programas-selector-detail-item">
                          📅 <strong>{item.fecha}</strong>
                        </span>
                        <span className="programas-selector-detail-item">
                          🕐 {item.hora_inicio} - {item.hora_fin}
                        </span>
                        <span className="programas-selector-detail-item">
                          ⏱️ {item.programa_info.duracion}h
                        </span>
                        <span className="programas-selector-detail-item programas-selector-costo">
                          💰 S/ {item.programa_info.costo}
                        </span>
                      </div>
                    </div>
                    <div className="programas-selector-actions">
                      <button
                        className="programas-selector-btn programas-selector-btn-edit programas-selector-btn-sm"
                        onClick={() => handleEditPrograma(item)}
                        title="Editar"
                      >
                        📝
                      </button>
                      <button
                        className="programas-selector-btn programas-selector-btn-danger programas-selector-btn-sm"
                        onClick={() => handleRemovePrograma(item.id_itinerario_programa || item.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="programas-selector-costo-total">
                <div className="programas-selector-costo-item">
                  <span>Costo Total:</span>
                  <strong>S/ {costoTotal.toFixed(2)}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para agregar programa */}
      {showAddModal && (
        <div className="programas-selector-modal-overlay">
          <div className="programas-selector-modal-content">
            <div className="programas-selector-modal-header">
              <h3>{editingProgramaId ? 'Editar Programa' : '➕ Agregar Programa'}</h3>
              <button
                className="programas-selector-modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setNuevoProgramaForm({
                    id_programa: '',
                    nombre: '',
                    descripcion: '',
                    tipo: '',
                    duracion: '',
                    costo: '',
                    fecha: '',
                    hora_inicio: '',
                    hora_fin: ''
                  });
                  setErrors({});
                }}
              >
                ✕
              </button>
            </div>

            <div className="programas-selector-modal-body">
              <div className="programas-selector-form-group">
                <label>Nombre del Programa *</label>
                <input
                  type="text"
                  value={nuevoProgramaForm.nombre}
                  onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del programa"
                  className={errors.nombre ? 'programas-selector-error' : ''}
                />
                {errors.nombre && <span className="programas-selector-error-message">{errors.nombre}</span>}
              </div>

              <div className="programas-selector-form-group">
                <label>Descripción</label>
                <textarea
                  value={nuevoProgramaForm.descripcion}
                  onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del programa"
                  rows="3"
                />
              </div>

              <div className="programas-selector-form-row">
                <div className="programas-selector-form-group">
                  <label>Tipo *</label>
                  <select
                    value={nuevoProgramaForm.tipo}
                    onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, tipo: e.target.value }))}
                    className={errors.tipo ? 'programas-selector-error' : ''}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="tour">Tour</option>
                    <option value="actividad">Actividad</option>
                    <option value="machupicchu">Machu Picchu</option>
                  </select>
                  {errors.tipo && <span className="programas-selector-error-message">{errors.tipo}</span>}
                </div>

                <div className="programas-selector-form-group">
                  <label>Duración (horas) *</label>
                  <input
                    type="number"
                    value={nuevoProgramaForm.duracion}
                    onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, duracion: e.target.value }))}
                    placeholder="8"
                    min="1"
                    className={errors.duracion ? 'programas-selector-error' : ''}
                  />
                  {errors.duracion && <span className="programas-selector-error-message">{errors.duracion}</span>}
                </div>
              </div>

              <div className="programas-selector-form-group">
                <label>Costo (S/) *</label>
                <input
                  type="number"
                  value={nuevoProgramaForm.costo}
                  onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, costo: e.target.value }))}
                  placeholder="350.00"
                  min="0"
                  step="0.01"
                  className={errors.costo ? 'programas-selector-error' : ''}
                />
                {errors.costo && <span className="programas-selector-error-message">{errors.costo}</span>}
              </div>

              <div className="programas-selector-form-group">
                <label>Fecha *</label>
                <input
                  type="date"
                  value={nuevoProgramaForm.fecha}
                  onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, fecha: e.target.value }))}
                  className={errors.fecha ? 'programas-selector-error' : ''}
                />
                {errors.fecha && <span className="programas-selector-error-message">{errors.fecha}</span>}
              </div>

              <div className="programas-selector-form-row">
                <div className="programas-selector-form-group">
                  <label>Hora de Inicio *</label>
                  <input
                    type="time"
                    value={nuevoProgramaForm.hora_inicio}
                    onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, hora_inicio: e.target.value }))}
                    className={errors.hora_inicio ? 'programas-selector-error' : ''}
                  />
                  {errors.hora_inicio && <span className="programas-selector-error-message">{errors.hora_inicio}</span>}
                </div>

                <div className="programas-selector-form-group">
                  <label>Hora de Fin *</label>
                  <input
                    type="time"
                    value={nuevoProgramaForm.hora_fin}
                    onChange={(e) => setNuevoProgramaForm(prev => ({ ...prev, hora_fin: e.target.value }))}
                    className={errors.hora_fin ? 'programas-selector-error' : ''}
                  />
                  {errors.hora_fin && <span className="programas-selector-error-message">{errors.hora_fin}</span>}
                </div>
              </div>

              {/* Vista previa */}
              {nuevoProgramaForm.nombre && nuevoProgramaForm.tipo && (
                <div className="programas-selector-preview">
                  <h5>📋 Vista Previa</h5>
                  <div className="programas-selector-preview-card">
                    <div className="programas-selector-preview-item">
                      <strong>{nuevoProgramaForm.nombre}</strong>
                    </div>
                    <div className="programas-selector-preview-item">
                      <strong>Tipo:</strong> {nuevoProgramaForm.tipo}
                    </div>
                    <div className="programas-selector-preview-item">
                      <strong>Fecha:</strong> {nuevoProgramaForm.fecha || 'No seleccionada'}
                    </div>
                    <div className="programas-selector-preview-item">
                      <strong>Horario:</strong> {nuevoProgramaForm.hora_inicio || 'No definido'} - {nuevoProgramaForm.hora_fin || 'No definido'}
                    </div>
                    <div className="programas-selector-preview-item">
                      <strong>Duración:</strong> {nuevoProgramaForm.duracion || 'No definida'} horas
                    </div>
                    <div className="programas-selector-preview-item">
                      <strong>Costo:</strong> S/ {nuevoProgramaForm.costo || '0.00'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="programas-selector-modal-footer">
              <button
                className="programas-selector-btn programas-selector-btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setNuevoProgramaForm({
                    id_programa: '',
                    nombre: '',
                    descripcion: '',
                    tipo: '',
                    duracion: '',
                    costo: '',
                    fecha: '',
                    hora_inicio: '',
                    hora_fin: ''
                  });
                  setErrors({});
                }}
              >
                Cancelar
              </button>
              <button
                className="programas-selector-btn programas-selector-btn-primary"
                onClick={() => {
                  console.log('ItinerarioProgramasSelector - Botón Agregar clickeado');
                  handleAddPrograma();
                }}
              >
                ✅ Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ItinerarioProgramasSelector;
