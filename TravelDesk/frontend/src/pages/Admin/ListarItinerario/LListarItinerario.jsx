import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus, FiEye, FiTrash2, FiCalendar, FiUsers, FiClock, FiSearch } from 'react-icons/fi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import '../../../styles/Admin/ListarItinerarios/ListarItinerarios.css';

const LListarItinerario = () => {
  const [itinerarios, setItinerarios] = useState([]);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    fechaInicio: '',
    fechaFin: '',
    ordenarPor: 'fecha_creacion',
    orden: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3000/api/itinerarios');
        const data = await res.json();
        if (active) setItinerarios(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Filtrar y ordenar itinerarios
  const filteredItinerarios = itinerarios.filter(itinerario => {
    // Filtro por búsqueda general
    if (filtros.busqueda) {
      const searchLower = filtros.busqueda.toLowerCase();
      const cumpleBusqueda = 
        (itinerario.id?.toString() || '').toLowerCase().includes(searchLower) ||
        (itinerario.grupo?.nombre_grupo?.toLowerCase() || '').includes(searchLower) ||
        (itinerario.destino_principal?.toLowerCase() || '').includes(searchLower);
      
      if (!cumpleBusqueda) return false;
    }

    // Filtro por estado
    if (filtros.estado && itinerario.estado_presupuesto?.toLowerCase() !== filtros.estado.toLowerCase()) {
      return false;
    }

    // Filtro por rango de fechas
    if (filtros.fechaInicio && new Date(itinerario.fecha_inicio) < new Date(filtros.fechaInicio)) {
      return false;
    }
    if (filtros.fechaFin && new Date(itinerario.fecha_fin) > new Date(filtros.fechaFin)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Ordenar resultados
    if (filtros.ordenarPor === 'fecha_creacion') {
      return filtros.orden === 'asc' 
        ? new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
        : new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
    } else if (filtros.ordenarPor === 'fecha_inicio') {
      return filtros.orden === 'asc'
        ? new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
        : new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
    }
    return 0;
  });

  // Obtener itinerarios para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItinerarios = filteredItinerarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItinerarios.length / itemsPerPage);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Manejadores de cambio de filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Resetear a la primera página al cambiar filtros
  };

  const toggleFiltros = () => {
    setMostrarFiltros(!mostrarFiltros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      estado: '',
      fechaInicio: '',
      fechaFin: '',
      ordenarPor: 'fecha_creacion',
      orden: 'desc',
    });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Estado del presupuesto
  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': { class: 'badge-warning', text: 'Pendiente' },
      'aprobado': { class: 'badge-success', text: 'Aprobado' },
      'rechazado': { class: 'badge-danger', text: 'Rechazado' },
      'en_revision': { class: 'badge-info', text: 'En Revisión' }
    };
    
    const estadoInfo = estados[estado?.toLowerCase()] || { class: 'badge-secondary', text: estado || 'Desconocido' };
    
    return (
      <span className={`badge ${estadoInfo.class}`}>
        {estadoInfo.text}
      </span>
    );
  };

  // Eliminar itinerario (solo si no tiene turistas)
  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm(`¿Eliminar el itinerario #${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:3000/api/itinerarios/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        alert(data?.error || 'No se pudo eliminar el itinerario');
        return;
      }
      // Actualizar lista en memoria
      setItinerarios(prev => prev.filter(it => it.id !== id));
    } catch (e) {
      console.error('Error al eliminar itinerario', e);
      alert('Error al eliminar el itinerario');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando itinerarios...</p>
      </div>
    );
  }

  return (
    <div className="listar-itinerarios-container">
      <div className="listar-itinerarios-header">
        <h1>Gestión de Itinerarios</h1>
        <Link to="/admin/itinerarios/nuevo" className="btn btn-primary">
          <FiPlus className="icon" /> Nuevo Itinerario
        </Link>
      </div>

      <div className="listar-itinerarios-filters">
        <div className="filters-header">
          <div className="search-box">
            <input
              type="text"
              name="busqueda"
              placeholder="Buscar por ID, grupo o destino..."
              value={filtros.busqueda}
              onChange={handleFiltroChange}
              className="form-control"
            />
            <FiSearch className="search-icon" />
          </div>
          <button 
            onClick={toggleFiltros} 
            className="btn btn-outline-secondary btn-filtros"
          >
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {mostrarFiltros && (
          <div className="filtros-avanzados">
            <div className="filtros-grid">
              <div className="filtro-group">
                <label>Estado</label>
                <select 
                  name="estado" 
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                  className="form-control"
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="en_revision">En Revisión</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Fecha Inicio Desde</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filtros.fechaInicio}
                  onChange={handleFiltroChange}
                  className="form-control"
                />
              </div>

              <div className="filtro-group">
                <label>Fecha Fin Hasta</label>
                <input
                  type="date"
                  name="fechaFin"
                  value={filtros.fechaFin}
                  onChange={handleFiltroChange}
                  className="form-control"
                />
              </div>

              <div className="filtro-group">
                <label>Ordenar por</label>
                <select 
                  name="ordenarPor"
                  value={filtros.ordenarPor}
                  onChange={handleFiltroChange}
                  className="form-control"
                >
                  <option value="fecha_creacion">Fecha de Creación</option>
                  <option value="fecha_inicio">Fecha de Inicio</option>
                </select>
              </div>

              <div className="filtro-group">
                <label>Orden</label>
                <select 
                  name="orden"
                  value={filtros.orden}
                  onChange={handleFiltroChange}
                  className="form-control"
                >
                  <option value="desc">Más recientes primero</option>
                  <option value="asc">Más antiguos primero</option>
                </select>
              </div>

              <div className="filtro-group filtro-acciones">
                <button 
                  onClick={limpiarFiltros} 
                  className="btn btn-outline-secondary"
                >
                  Limpiar Filtros
                </button>
                <span className="resultados-count">
                  {filteredItinerarios.length} resultados encontrados
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredItinerarios.length > 0 ? (
        <div className="itinerarios-grid">
          {currentItinerarios.map((itinerario) => (
            <div key={itinerario.id} className="itinerario-card">
              <div className="itinerario-card-header">
                <h3 className="itinerario-card-title">
                  🗓️ {itinerario.grupo?.nombre_grupo || 'Itinerario sin grupo'}
                  <span className="itinerario-card-id">#{itinerario.id}</span>
                </h3>
              </div>
              <div className="itinerario-card-body">
                <div className="itinerario-detail">
                  <span className="itinerario-detail-label">Fechas</span>
                  <span className="itinerario-detail-value">
                    <FiCalendar />
                    {formatDate(itinerario.fecha_inicio)} - {formatDate(itinerario.fecha_fin)}
                  </span>
                </div>
                
                <div className="itinerario-detail">
                  <span className="itinerario-detail-label">Estado</span>
                  <span className="itinerario-detail-value">
                    {getEstadoBadge(itinerario.estado_presupuesto)}
                  </span>
                </div>
                
                {itinerario.grupo?.descripcion && (
                  <div className="itinerario-detail">
                    <span className="itinerario-detail-label">Descripción</span>
                    <span className="itinerario-detail-value">
                      {itinerario.grupo.descripcion.substring(0, 80)}
                      {itinerario.grupo.descripcion.length > 80 ? '...' : ''}
                    </span>
                  </div>
                )}
              </div>
              <div className="itinerario-card-footer">
                <div className="actions">
                  <Link 
                    to={`/admin/itinerarios/${itinerario.id}/resumen`}
                    className="btn-icon btn-view"
                    title="Ver detalles"
                    state={{ itinerario: itinerario }}
                  >
                    <FiEye size={16} />
                  </Link>
                  <Link 
                    to={`/admin/editar-itinerario/${itinerario.id}`}
                    className="btn-icon btn-edit"
                    title="Editar"
                    state={{ itinerario: itinerario }}
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <button 
                    className="btn-icon btn-delete"
                    title={(itinerario.turistas?.length || 0) > 0 ? 'No se puede eliminar: tiene turistas asociados' : 'Eliminar'}
                    type="button"
                    disabled={(itinerario.turistas?.length || 0) > 0}
                    onClick={() => handleDelete(itinerario.id)}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            {searchTerm ? '🔍' : '📋'}
          </div>
          <h3 className="empty-state-title">
            {searchTerm 
              ? 'No se encontraron itinerarios' 
              : 'No hay itinerarios registrados'}
          </h3>
          <p className="empty-state-description">
            {searchTerm 
              ? 'No hay resultados que coincidan con tu búsqueda. Intenta con otros términos.'
              : 'Comienza creando un nuevo itinerario para gestionar tus viajes.'}
          </p>
          {!searchTerm && (
            <Link to="/admin/itinerarios/nuevo" className="btn btn-primary">
              <FiPlus className="icon" /> Crear primer itinerario
            </Link>
          )}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-arrow"
            aria-label="Página anterior"
          >
            &laquo;
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
                aria-label={`Ir a la página ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-arrow"
            aria-label="Siguiente página"
          >
            &raquo;
          </button>
          
          <div className="pagination-info">
            Página {currentPage} de {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default LListarItinerario;