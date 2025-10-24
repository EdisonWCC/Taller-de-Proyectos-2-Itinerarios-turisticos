import { useState, useMemo, useEffect } from 'react';
import EditarTuristaForm from './EditarTuristaForm';
import '../styles/Admin/ListarTuristasTable.css';

const ListarTuristasTable = () => {
  // Estados para la tabla
  const [turistas, setTuristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estados para filtros y paginación
  const [filtros, setFiltros] = useState({
    busqueda: '',
    nacionalidad: '',
    genero: '',
    estado: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  // Estados para el modal de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turistaSeleccionado, setTuristaSeleccionado] = useState(null);

  // Cargar turistas desde API
  useEffect(() => {
    const fetchTuristas = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/api/turistas");
        if (!response.ok) throw new Error("Error al cargar turistas");
        const data = await response.json();
        setTuristas(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Error de conexión");
        setTuristas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTuristas();
  }, []);

  // Obtener opciones únicas para los filtros
  const nacionalidades = useMemo(() => {
    const paises = [...new Set(turistas.map(t => t.nacionalidad))];
    return paises.sort();
  }, [turistas]);

  // Filtrar turistas basado en los filtros aplicados
  const turistasFiltrados = useMemo(() => {
    return turistas.filter(turista => {
      const coincideBusqueda = filtros.busqueda === '' ||
        `${turista.nombre} ${turista.apellido}`.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        turista.email.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        (turista.dni || turista.documento || '').includes(filtros.busqueda);

      const coincideNacionalidad = filtros.nacionalidad === '' ||
        turista.nacionalidad === filtros.nacionalidad;

      const coincideGenero = filtros.genero === '' ||
        turista.genero === filtros.genero;

      const coincideEstado = filtros.estado === '' ||
        (filtros.estado === 'activo' && turista.activo) ||
        (filtros.estado === 'inactivo' && !turista.activo);

      return coincideBusqueda && coincideNacionalidad && coincideGenero && coincideEstado;
    });
  }, [turistas, filtros]);

  // Calcular paginación después de los filtros
  const totalPaginas = Math.ceil(turistasFiltrados.length / elementosPorPagina);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const indiceFin = indiceInicio + elementosPorPagina;
  const turistasPaginados = turistasFiltrados.slice(indiceInicio, indiceFin);

  // Resetear página cuando cambian los filtros
  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }));
    setPaginaActual(1); // Resetear a página 1
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      nacionalidad: '',
      genero: '',
      estado: ''
    });
    setPaginaActual(1);
  };

  // Función para cambiar página
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  // Función para abrir modal de edición
  const abrirModalEditar = (turista) => {
    setTuristaSeleccionado(turista);
    setModalAbierto(true);
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setTuristaSeleccionado(null);
  };

  // Función para refrescar datos después de guardar
  const refrescarDatos = () => {
    // Recargar los turistas desde la API
    const fetchTuristas = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3000/api/turistas");
        if (!response.ok) throw new Error("Error al cargar turistas");
        const data = await response.json();
        setTuristas(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Error de conexión");
        setTuristas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTuristas();
  };

  // Función para toggle de estado activo/inactivo
  const toggleEstado = async (turista) => {
    const nuevoEstado = !turista.activo;
    const confirmacion = window.confirm(
      `¿Estás seguro de que deseas ${nuevoEstado ? 'activar' : 'desactivar'} a ${turista.nombre} ${turista.apellido}?`
    );

    if (!confirmacion) return;

    try {
      const response = await fetch(`http://localhost:3000/api/turistas/${turista.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: nuevoEstado }),
      });

      if (response.ok) {
        // Actualizar la lista localmente
        setTuristas(prevTuristas =>
          prevTuristas.map(t =>
            t.id === turista.id
              ? { ...t, activo: nuevoEstado }
              : t
          )
        );
        alert(`Turista ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        alert('Error al cambiar estado del turista');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="listar-turistas-container">
      <div className="listar-turistas-header">
        <h2>Lista de Turistas</h2>
        <p className="total-count">
          {turistasFiltrados.length > elementosPorPagina
            ? `Mostrando ${indiceInicio + 1}-${Math.min(indiceFin, turistasFiltrados.length)} de ${turistasFiltrados.length} turistas`
            : `Total: ${turistasFiltrados.length} de ${turistas.length} turistas`
          }
        </p>
      </div>

      <div className="listar-turistas-filters">
        <input
          type="text"
          value={filtros.busqueda}
          onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
          placeholder="Buscar por nombre, email o documento..."
        />

        <select
          value={filtros.nacionalidad}
          onChange={(e) => handleFiltroChange('nacionalidad', e.target.value)}
        >
          <option value="">Todas las nacionalidades</option>
          {nacionalidades.map(pais => (
            <option key={pais} value={pais}>{pais}</option>
          ))}
        </select>

        <select
          value={filtros.genero}
          onChange={(e) => handleFiltroChange('genero', e.target.value)}
        >
          <option value="">Todos los géneros</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>

        <select
          value={filtros.estado}
          onChange={(e) => handleFiltroChange('estado', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Solo activos</option>
          <option value="inactivo">Solo inactivos</option>
        </select>

        <button onClick={limpiarFiltros} className="btn-limpiar">
          🧹 Limpiar filtros
        </button>
      </div>

      <div className="listar-turistas-table-wrapper">
        {loading ? (
          <div className="loading">Cargando turistas...</div>
        ) : error ? (
          <div className="no-data">
            <div className="no-data-content">
              <span className="no-data-icon">❌</span>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-limpiar">
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <table className="listar-turistas-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>País</th>
                <th>Género</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turistasPaginados.length > 0 ? (
                turistasPaginados.map(turista => (
                  <tr key={turista.id}>
                    <td>{turista.nombre}</td>
                    <td>{turista.apellido}</td>
                    <td>{turista.email}</td>
                    <td>{turista.dni || turista.documento || 'N/A'}</td>
                    <td>{turista.telefono || 'N/A'}</td>
                    <td>
                      <span className="badge badge-pais">{turista.nacionalidad}</span>
                    </td>
                    <td>
                      <span className="badge badge-genero">{turista.genero || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge ${turista.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                        {turista.activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="acciones-buttons">
                        <button
                          className="btn-editar"
                          title="Editar turista"
                          onClick={() => abrirModalEditar(turista)}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className={`btn-toggle ${turista.activo ? 'btn-desactivar' : 'btn-activar'}`}
                          title={turista.activo ? 'Desactivar turista' : 'Activar turista'}
                          onClick={() => toggleEstado(turista)}
                        >
                          {turista.activo ? '❌' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon">🔍</span>
                      <p>No se encontraron turistas con los filtros aplicados</p>
                      <button onClick={limpiarFiltros} className="btn-limpiar">
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Controles de paginación */}
      {turistasFiltrados.length > elementosPorPagina && (
        <div className="paginacion-container">
          <div className="paginacion-info">
            Página {paginaActual} de {totalPaginas}
          </div>
          <div className="paginacion-controls">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="paginacion-btn"
            >
              ⬅️ Anterior
            </button>

            <div className="paginacion-numeros">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(numero => (
                <button
                  key={numero}
                  onClick={() => cambiarPagina(numero)}
                  className={`paginacion-numero ${paginaActual === numero ? 'activo' : ''}`}
                >
                  {numero}
                </button>
              ))}
            </div>

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="paginacion-btn"
            >
              Siguiente ➡️
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edición usando el componente existente */}
      <EditarTuristaForm
        isOpen={modalAbierto}
        onClose={cerrarModal}
        turistaSeleccionado={turistaSeleccionado}
        onSave={refrescarDatos}
      />
    </div>
  );
};

export default ListarTuristasTable;
