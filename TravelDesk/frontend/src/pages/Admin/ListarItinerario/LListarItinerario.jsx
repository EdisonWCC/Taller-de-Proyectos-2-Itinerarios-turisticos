import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';
import '../../../styles/Admin/ListarItinerarios/ListarItinerarios.css';

// Datos de ejemplo siguiendo la estructura del flujo de creación
const mockItinerarios = [
  {
    id: 1,
    grupo: {
      id_grupo: 1,
      nombre_grupo: 'Aventura Cusco Nov 2025',
      descripcion: 'Grupo familiar visitando Cusco y Machu Picchu',
      cantidad_personas: 6,
      fecha_creacion: '2025-10-25',
      estado: 'activo',
      contacto_emergencia: {
        nombre: 'Carlos Martínez',
        telefono: '+51 987654321',
        parentesco: 'Padre de familia'
      }
    },
    fecha_inicio: '2025-11-20',
    fecha_fin: '2025-11-25',
    estado_presupuesto_id: 2, // 1=pendiente, 2=en_revision, 3=aprobado
    total_presupuesto: 4500.00,
    moneda: 'USD',
    programas: [
      {
        id: 1,
        id_programa: 1,
        fecha: '2025-11-20',
        hora_inicio: '12:00',
        hora_fin: '13:30',
        notas: 'Vuelo LATAM 2045 - Confirmar horario de llegada',
        programa_info: {
          id: 1,
          nombre: 'Traslado Aeropuerto - Hotel',
          tipo: 'traslado',
          descripcion: 'Recogida en el aeropuerto y traslado al hotel',
          duracion: 1.5,
          precio_persona: 25.00
        },
        estado: 'pendiente'
      },
      {
        id: 2,
        id_programa: 2,
        fecha: '2025-11-21',
        hora_inicio: '09:00',
        hora_fin: '17:00',
        notas: 'Incluye almuerzo buffet',
        programa_info: {
          id: 2,
          nombre: 'City Tour Cusco',
          tipo: 'tour',
          descripcion: 'Recorrido por los principales atractivos de Cusco',
          duracion: 8,
          precio_persona: 120.00
        },
        estado: 'confirmado'
      },
      {
        id: 2,
        fecha: '2025-11-16',
        hora_inicio: '09:00',
        hora_fin: '17:00',
        programa_info: {
          id: 2,
          nombre: 'City Tour Cusco',
          tipo: 'tour',
          descripcion: 'Recorrido por los principales atractivos de Cusco',
          duracion: 8,
          precio_persona: 120.00
        },
        notas: 'Incluye almuerzo buffet en restaurante local',
        guia_asignado: 'Juan Pérez',
        estado: 'confirmado',
        lugares_visita: [
          'Catedral de Cusco',
          'Qoricancha',
          'Sacsayhuamán',
          'Qenqo',
          'Puca Pucará',
          'Tambomachay'
        ]
      },
      {
        id: 3,
        fecha: '2025-11-17',
        hora_inicio: '04:30',
        hora_fin: '20:00',
        programa_info: {
          id: 3,
          nombre: 'Tour al Valle Sagrado',
          tipo: 'tour',
          descripcion: 'Visita a los pueblos y sitios arqueológicos del Valle Sagrado',
          duracion: 15.5,
          precio_persona: 180.00
        },
        notas: 'Incluye almuerzo buffet en Urubamba. Llevar ropa abrigadora y bloqueador solar.',
        guia_asignado: 'Carlos Huamán',
        estado: 'confirmado',
        lugares_visita: [
          'Pisac',
          'Mercado de Pisac',
          'Ollantaytambo',
          'Chinchero'
        ]
      },
      {
        id: 4,
        id_programa: 4,
        fecha: '2025-11-18',
        hora_inicio: '05:00',
        hora_fin: '19:00',
        programa_info: {
          id: 4,
          nombre: 'Machu Picchu Full Day',
          tipo: 'machupicchu',  // Cambiado de 'tour' a 'machupicchu'
          descripcion: 'Visita a la ciudadela inca de Machu Picchu',
          duracion: 14,
          precio_persona: 350.00,
          incluye: [
            'Tren Expedition ida y vuelta',
            'Bus a Machu Picchu',
            'Guía profesional bilingüe',
            'Almuerzo en Aguas Calientes',
            'Entrada a Machu Picchu'
          ],
          recomendaciones: [
            'Llevar pasaporte original',
            'Usar zapatos cómodos',
            'Llevar bloqueador solar y gorra',
            'Llevar dinero en efectivo'
          ]
        },
        notas: 'Tren Expedition 6:10 AM. Llevar pasaporte original. Incluye almuerzo en Aguas Calientes.',
        guia_asignado: 'Ana Quispe',
        estado: 'confirmado',
        lugares_visita: [
          'Estación de Ollantaytambo',
          'Aguas Calientes',
          'Machu Picchu',
          'Montaña Huayna Picchu (opcional)'
        ],
        detalles_machupicchu: {
          id_itinerario_programa: 4,  // Necesario para la relación con el programa
          nombre_guia: 'Ana Quispe',
          empresa_tren: 'PeruRail',
          ruta: 'Circuito 2',
          horario_tren_ida: '06:10',
          horario_tren_retor: '18:20',
          tiempo_visita: '4 horas'
        }
      },
      {
        id: 5,
        fecha: '2025-11-19',
        hora_inicio: '09:00',
        hora_fin: '15:00',
        programa_info: {
          id: 5,
          nombre: 'Tour Maras y Moray',
          tipo: 'tour',
          descripcion: 'Visita a las salineras de Maras y los andenes circulares de Moray',
          duracion: 6,
          precio_persona: 95.00
        },
        notas: 'Tarde libre después del almuerzo para compras en Cusco',
        guia_asignado: 'Luis Mendoza',
        estado: 'confirmado'
      },
      {
        id: 6,
        fecha: '2025-11-20',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        programa_info: {
          id: 6,
          nombre: 'Traslado Hotel - Aeropuerto',
          tipo: 'traslado',
          descripcion: 'Traslado al aeropuerto para vuelo de regreso',
          duracion: 1,
          precio_persona: 25.00
        },
        notas: 'Vuelo LATAM 2046 - Presentarse 3 horas antes',
        estado: 'pendiente'
      }
    ],
    transportes: [
      {
        id_detalle_transporte: 1,
        id_itinerario_programa: 1,  // Coincide con el ID del programa de traslado
        id_transporte: 1,
        horario_recojo: "12:00",
        lugar_recojo: "Aeropuerto Internacional Alejandro Velasco Astete",
        programa_info: {
          id_itinerario_programa: 1,
          nombre: "Traslado Aeropuerto - Hotel",
          fecha: "2025-11-20",
          hora_inicio: "12:00",
          hora_fin: "13:30"
        },
        transporte_info: {
          id_transporte: 1,
          tipo: "van",
          descripcion: "Van de 12 asientos con aire acondicionado",
          empresa: "Transportes Cusco",
          fecha: "2025-11-20",
          hora_salida: "12:00",
          hora_llegada: "13:30",
          origen: "Aeropuerto Internacional Alejandro Velasco Astete",
          destino: "Hotel en Cusco",
          conductor: "Juan Pérez",
          telefono_conductor: "+51 987654321",
          placa: "ABC-123",
          capacidad: 12,
          estado: "confirmado"
        }
      },
      {
        id_detalle_transporte: 2,
        id_itinerario_programa: 2,  // Coincide con el ID del City Tour
        id_transporte: 2,
        horario_recojo: "08:30",
        lugar_recojo: "Hotel en Cusco",
        programa_info: {
          id_itinerario_programa: 2,
          nombre: "City Tour Cusco",
          fecha: "2025-11-21",
          hora_inicio: "09:00",
          hora_fin: "17:00"
        },
        transporte_info: {
          id_transporte: 2,
          tipo: "bus",
          descripcion: "Bus turístico 20 asientos",
          empresa: "Cusco Tours",
          fecha: "2025-11-21",
          hora_salida: "08:30",
          hora_llegada: "17:30",
          origen: "Hotel en Cusco",
          destino: "Centro Histórico de Cusco",
          conductor: "Carlos Rodríguez",
          telefono_conductor: "+51 987654322",
          placa: "DEF-456",
          capacidad: 20,
          estado: "pendiente"
        }
      }
    ],
    turistas: [
      {
        id_turista: 1,
        nombre: 'Carlos',
        apellido: 'Martínez',
        dni: '12345678',
        nacionalidad: 'Peruano',
        fecha_nacimiento: '1980-05-15',
        genero: 'Masculino'
      },
      {
        id_turista: 2,
        nombre: 'Ana',
        apellido: 'Martínez',
        dni: '23456789',
        nacionalidad: 'Peruana',
        fecha_nacimiento: '1982-08-22',
        genero: 'Femenino'
      },
      {
        id_turista: 3,
        nombre: 'Diego',
        apellido: 'Martínez',
        dni: '34567890',
        nacionalidad: 'Peruano',
        fecha_nacimiento: '2010-03-10',
        genero: 'Masculino'
      },
      {
        id_turista: 4,
        nombre: 'Sofía',
        apellido: 'Martínez',
        dni: '45678901',
        nacionalidad: 'Peruana',
        fecha_nacimiento: '2012-07-18',
        genero: 'Femenino'
      },
      {
        id_turista: 5,
        nombre: 'Roberto',
        apellido: 'Gómez',
        dni: '56789012',
        nacionalidad: 'Español',
        fecha_nacimiento: '1975-11-30',
        genero: 'Masculino'
      },
      {
        id_turista: 6,
        nombre: 'Laura',
        apellido: 'Gómez',
        dni: '67890123',
        nacionalidad: 'Española',
        fecha_nacimiento: '1978-04-25',
        genero: 'Femenino'
      }
    ]
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
    if (!searchTerm) return true; // Si no hay término de búsqueda, mostrar todos
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (itinerario.id?.toString() || '').toLowerCase().includes(searchLower) ||
      (itinerario.grupo?.nombre_grupo?.toLowerCase() || '').includes(searchLower) ||
      (itinerario.fecha_inicio || '').includes(searchLower) ||
      (itinerario.fecha_fin || '').includes(searchLower) ||
      (itinerario.estado_presupuesto?.toLowerCase() || '').includes(searchLower)
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
                      to={`/admin/editar-itinerario/${itinerario.id}`} 
                      className="btn-icon btn-edit"
                      title="Editar"
                      state={{ itinerario: itinerario }}
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