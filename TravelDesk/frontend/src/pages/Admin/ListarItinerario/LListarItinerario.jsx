import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import '../../../styles/Admin/ListarItinerarios/ListarItinerarios.css';

// Datos de ejemplo
const mockItinerarios = [
  {
    id: 1,
    grupo: { nombre_grupo: 'Grupo Familiar' },
    fecha_inicio: '2025-11-15',
    fecha_fin: '2025-11-22',
    estado_presupuesto: 'pendiente'
  },
  {
    id: 2,
    grupo: { nombre_grupo: 'Grupo de Amigos' },
    fecha_inicio: '2025-12-01',
    fecha_fin: '2025-12-10',
    estado_presupuesto: 'aprobado'
  },
  {
    id: 3,
    grupo: { nombre_grupo: 'Viaje de Negocios' },
    fecha_inicio: '2025-12-15',
    fecha_fin: '2025-12-20',
    estado_presupuesto: 'en_revision'
  }
];

const LListarItinerario = () => {
  const [itinerarios] = useState(mockItinerarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const loading = false;

  // Datos de ejemplo ya cargados

  // Filtrar itinerarios por término de búsqueda
  const filteredItinerarios = itinerarios.filter(itinerario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      itinerario.id.toString().includes(searchLower) ||
      (itinerario.grupo?.nombre_grupo?.toLowerCase().includes(searchLower) || '') ||
      itinerario.fecha_inicio?.includes(searchLower) ||
      itinerario.fecha_fin?.includes(searchLower) ||
      itinerario.estado_presupuesto?.toLowerCase().includes(searchLower)
    );
  });

  // Obtener itinerarios para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItinerarios = filteredItinerarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItinerarios.length / itemsPerPage);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  // Función de ejemplo para eliminar (sin backend)
  const handleDelete = (id) => {
    console.log('Eliminar itinerario:', id);
    // En una implementación real, aquí iría la llamada a la API
    alert(`Se eliminaría el itinerario ${id} en una implementación real`);
  };

  if (loading) {
    return (
      <div className="listar-itinerarios-loading">
        <div className="spinner"></div>
        <p>Cargando itinerarios...</p>
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
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar itinerarios..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="form-control"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="itinerarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Grupo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItinerarios.length > 0 ? (
              currentItinerarios.map((itinerario) => (
                <tr key={itinerario.id}>
                  <td>#{itinerario.id}</td>
                  <td>{itinerario.grupo?.nombre_grupo || 'Sin grupo'}</td>
                  <td>{formatDate(itinerario.fecha_inicio)}</td>
                  <td>{formatDate(itinerario.fecha_fin)}</td>
                  <td>{getEstadoBadge(itinerario.estado_presupuesto)}</td>
                  <td className="actions">
                    <Link 
                      to={`/admin/itinerarios/${itinerario.id}`} 
                      className="btn-icon btn-view"
                      title="Ver detalles"
                    >
                      <FiEye />
                    </Link>
                    <Link 
                      to={`/admin/itinerarios/editar/${itinerario.id}`} 
                      className="btn-icon btn-edit"
                      title="Editar"
                    >
                      <FiEdit2 />
                    </Link>
                    <button 
                      onClick={() => handleDelete(itinerario.id)}
                      className="btn-icon btn-delete"
                      title="Eliminar"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  {searchTerm ? 'No se encontraron itinerarios que coincidan con la búsqueda' : 'No hay itinerarios registrados'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-arrow"
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
                onClick={() => paginate(pageNum)}
                className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-arrow"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default LListarItinerario;