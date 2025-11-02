import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../../styles/Admin/Itinerario/ItinerarioTuristasSelector.css';

const ItinerarioTuristasSelector = forwardRef(({ initialData = [], initialTuristas = [], onTuristasChange, itinerarioData = null, grupoId = null }, ref) => {
  const [turistasSeleccionados, setTuristasSeleccionados] = useState(initialData && initialData.length > 0 ? initialData : initialTuristas);
  const [turistasDisponibles, setTuristasDisponibles] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [errors, setErrors] = useState({});

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    getData: () => turistasSeleccionados,
    validate: validateSelection,
    isValid: () => turistasSeleccionados.length > 0,
    getProgress: () => ({
      total: turistasDisponibles.length,
      selected: turistasSeleccionados.length,
      percentage: turistasDisponibles.length > 0 ? (turistasSeleccionados.length / turistasDisponibles.length) * 100 : 0
    })
  }));

  // Notificar cambios al padre (depend only on local state to avoid loops)
  useEffect(() => {
    if (onTuristasChange) onTuristasChange(turistasSeleccionados);
  }, [turistasSeleccionados]);

  // Cargar datos de la API real
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [respTuristas, respGrupos] = await Promise.all([
          fetch('http://localhost:3000/api/turistas'),
          fetch('http://localhost:3000/api/grupos')
        ]);
        const [turistasData, gruposData] = await Promise.all([
          respTuristas.json(),
          respGrupos.json()
        ]);
        const turistasMap = Array.isArray(turistasData)
          ? turistasData.map(t => ({
              id_turista: t.id || t.id_turista,
              nombre: t.nombre,
              apellido: t.apellido,
              dni: t.dni,
              pasaporte: t.pasaporte,
              nacionalidad: t.nacionalidad,
              fecha_nacimiento: t.fecha_nacimiento,
              genero: t.genero
            }))
          : [];
        const gruposMap = Array.isArray(gruposData)
          ? gruposData.map(g => ({ id_grupo: g.id_grupo, nombre: g.nombre, descripcion: g.descripcion }))
          : [];
        setTuristasDisponibles(turistasMap);
        setGrupos(gruposMap);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setErrors({ general: 'Error al cargar los datos' });
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar turistas por búsqueda
  const filteredTuristas = turistasDisponibles.filter(turista => {
    const fullName = `${turista.nombre} ${turista.apellido}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
           turista.dni?.includes(searchLower) ||
           turista.pasaporte?.includes(searchLower) ||
           turista.nacionalidad?.toLowerCase().includes(searchLower);
  });

  // Agregar turistas de un grupo
  const handleAddGrupo = async () => {
    if (!selectedGrupo) return;
    try {
      const resp = await fetch(`http://localhost:3000/api/grupos/${selectedGrupo}/turistas`);
      const data = await resp.json();
      const turistasDelGrupo = Array.isArray(data)
        ? data.map(t => ({
            id_turista: t.id_turista || t.id,
            nombre: t.nombre,
            apellido: t.apellido,
            dni: t.dni,
            pasaporte: t.pasaporte,
            nacionalidad: t.nacionalidad,
            fecha_nacimiento: t.fecha_nacimiento,
            genero: t.genero
          }))
        : [];
      const nuevosTuristas = turistasDelGrupo.filter(t => !turistasSeleccionados.find(s => s.id_turista === t.id_turista));
      setTuristasSeleccionados(prev => [...prev, ...nuevosTuristas]);
      setSelectedGrupo('');
    } catch (e) {
      alert('Error obteniendo turistas del grupo');
    }
  };

  // Agregar turista individual
  const handleAddTurista = (turista) => {
    if (turistasSeleccionados.find(t => t.id_turista === turista.id_turista)) {
      return; // Ya está seleccionado
    }
    setTuristasSeleccionados(prev => [...prev, turista]);
  };

  // Eliminar turista
  const handleRemoveTurista = (idTurista) => {
    setTuristasSeleccionados(prev => prev.filter(t => t.id_turista !== idTurista));
  };

  // Checkbox para seleccionar múltiples
  const handleSelectTurista = (turista, isSelected) => {
    if (isSelected) {
      if (!turistasSeleccionados.find(t => t.id_turista === turista.id_turista)) {
        setTuristasSeleccionados(prev => [...prev, turista]);
      }
    } else {
      setTuristasSeleccionados(prev => prev.filter(t => t.id_turista !== turista.id_turista));
    }
  };

  // Validación de turistas seleccionados
  const validateSelection = () => {
    if (turistasSeleccionados.length === 0) {
      setErrors({ general: 'Debes seleccionar al menos un turista' });
      return false;
    }
    setErrors({});
    return true;
  };

  return (
    <div className="step-wizard-container">
      <div className="turistas-selector-header expanded turistas">
        <div className="turistas-selector-step-info">
          <div className="turistas-selector-step-number">3</div>
          <div className="turistas-selector-step-title">
            <h3>👥 Asociación de Turistas</h3>
            <p>Selecciona los turistas que participarán en este itinerario</p>
          </div>
        </div>
      </div>

      <div className="turistas-selector-content">
        {/* Primera Columna - Controles y turistas disponibles */}
        <div className="turistas-selector-left-panel">
          {/* Contenedor de controles en grid */}
          <div className="turistas-selector-controls-grid">
            {/* Selector por grupo */}
            <div className="turistas-selector-grupo-selector">
              <h4>📋 Agregar por Grupo</h4>
              <div className="turistas-selector-form-group">
                <label>Seleccionar Grupo</label>
                <div className="turistas-selector-form-row">
                  <select
                    value={selectedGrupo}
                    onChange={(e) => setSelectedGrupo(e.target.value)}
                    className="turistas-selector-form-control"
                  >
                    <option value="">Seleccionar grupo...</option>
                    {grupos.map(grupo => (
                      <option key={grupo.id_grupo} value={grupo.id_grupo}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={handleAddGrupo}
                    disabled={!selectedGrupo}
                  >
                    ➕ Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Buscador de turistas */}
            <div className="turistas-selector-turistas-search">
              <h4>🔍 Buscar Turistas</h4>
              <div className="turistas-selector-form-group">
                <label>Buscar por nombre, DNI, pasaporte o nacionalidad</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribe para buscar..."
                  className="turistas-selector-form-control search-input"
                />
              </div>
            </div>
          </div>

          {/* Lista de turistas disponibles */}
          <div className="turistas-selector-turistas-disponibles">
            <h4>📋 Turistas Disponibles</h4>
            {loading && (
              <div className="turistas-selector-loading-state">
                <p>Cargando turistas disponibles...</p>
              </div>
            )}

            {errors.general && (
              <div className="turistas-selector-error-message">
                {errors.general}
              </div>
            )}

            {filteredTuristas.length === 0 ? (
              <div className="turistas-selector-empty-state">
                <p>No se encontraron turistas con ese criterio de búsqueda.</p>
              </div>
            ) : (
              <div className="turistas-selector-turistas-list">
                {filteredTuristas.map(turista => (
                  <div key={turista.id_turista} className="turistas-selector-turista-item">
                    <div className="turistas-selector-turista-info">
                      <div className="turistas-selector-turista-header">
                        <h5>{turista.nombre} {turista.apellido}</h5>
                        <span className="turista-nacionalidad">{turista.nacionalidad}</span>
                      </div>
                      <div className="turistas-selector-turista-details">
                        <span className="turistas-selector-detail-item">
                          🆔 DNI: {turista.dni || 'No registrado'}
                        </span>
                        <span className="turistas-selector-detail-item">
                          📄 Pasaporte: {turista.pasaporte || 'No registrado'}
                        </span>
                        <span className="turistas-selector-detail-item">
                          🎂 {new Date(turista.fecha_nacimiento).toLocaleDateString() || 'Fecha no registrada'}
                        </span>
                      </div>
                    </div>
                    <div className="turistas-selector-turista-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddTurista(turista)}
                        disabled={turistasSeleccionados.find(t => t.id_turista === turista.id_turista)}
                      >
                        {turistasSeleccionados.find(t => t.id_turista === turista.id_turista) ? '✅ Agregado' : '➕ Agregar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Segunda Columna - Turistas seleccionados */}
        <div className="turistas-selector-right-panel">
          <div className="turistas-selector-section-header">
            <h4>✅ Turistas Seleccionados ({turistasSeleccionados.length})</h4>
          </div>

          {turistasSeleccionados.length === 0 ? (
            <div className="turistas-selector-empty-state">
              <p>No hay turistas seleccionados para este itinerario.</p>
            </div>
          ) : (
            <div className="turistas-selector-turistas-table">
              <table className="turistas-selector-data-table">
                <thead>
                  <tr>
                    <th>Turista Seleccionado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turistasSeleccionados.map(turista => (
                    <tr key={turista.id_turista}>
                      <td>
                        <div className="turistas-selector-selected-info">
                          <strong>{turista.nombre} {turista.apellido}</strong>
                          <div className="turistas-selector-selected-details">
                            <span className="turistas-selector-detail-badge">📋 {turista.nacionalidad}</span>
                            {turista.dni && <span className="turistas-selector-detail-badge">🆔 {turista.dni}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveTurista(turista.id_turista)}
                          title="Eliminar turista"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ItinerarioTuristasSelector;
