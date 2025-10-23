import { useState, useMemo } from 'react';
import '../styles/Admin/ListarTuristasTable.css';

const ListarTuristasTable = () => {
  // Datos de ejemplo para la tabla (simulando API)
  const [turistas] = useState([
    {
      id: 1,
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@email.com',
      documento: '12345678',
      telefono: '555-0101',
      nacionalidad: 'Argentina',
      genero: 'Femenino',
      activo: true
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      documento: '87654321',
      telefono: '555-0102',
      nacionalidad: 'México',
      genero: 'Masculino',
      activo: true
    },
    {
      id: 3,
      nombre: 'Ana',
      apellido: 'López',
      email: 'ana.lopez@email.com',
      documento: '11223344',
      telefono: '555-0103',
      nacionalidad: 'España',
      genero: 'Femenino',
      activo: false
    },
    {
      id: 4,
      nombre: 'Juan',
      apellido: 'Martínez',
      email: 'juan.martinez@email.com',
      documento: '99887766',
      telefono: '555-0104',
      nacionalidad: 'Argentina',
      genero: 'Masculino',
      activo: true
    },
    {
      id: 5,
      nombre: 'Lucía',
      apellido: 'Fernández',
      email: 'lucia.fernandez@email.com',
      documento: '55443322',
      telefono: '555-0105',
      nacionalidad: 'Chile',
      genero: 'Femenino',
      activo: true
    },
    {
      id: 6,
      nombre: 'Diego',
      apellido: 'Sánchez',
      email: 'diego.sanchez@email.com',
      documento: '66778899',
      telefono: '555-0106',
      nacionalidad: 'Colombia',
      genero: 'Masculino',
      activo: false
    },
    {
      id: 7,
      nombre: 'Carmen',
      apellido: 'Pérez',
      email: 'carmen.perez@email.com',
      documento: '77889900',
      telefono: '555-0107',
      nacionalidad: 'Perú',
      genero: 'Femenino',
      activo: true
    },
    {
      id: 8,
      nombre: 'Miguel',
      apellido: 'Torres',
      email: 'miguel.torres@email.com',
      documento: '88990011',
      telefono: '555-0108',
      nacionalidad: 'Uruguay',
      genero: 'Masculino',
      activo: true
    },
    {
      id: 9,
      nombre: 'Sofia',
      apellido: 'Ramírez',
      email: 'sofia.ramirez@email.com',
      documento: '44556677',
      telefono: '555-0109',
      nacionalidad: 'Brasil',
      genero: 'Femenino',
      activo: true
    },
    {
      id: 10,
      nombre: 'Andrés',
      apellido: 'Morales',
      email: 'andres.morales@email.com',
      documento: '33445566',
      telefono: '555-0110',
      nacionalidad: 'Ecuador',
      genero: 'Masculino',
      activo: true
    },
    {
      id: 11,
      nombre: 'Isabella',
      apellido: 'García',
      email: 'isabella.garcia@email.com',
      documento: '22334455',
      telefono: '555-0111',
      nacionalidad: 'Venezuela',
      genero: 'Femenino',
      activo: false
    },
    {
      id: 12,
      nombre: 'Felipe',
      apellido: 'Díaz',
      email: 'felipe.diaz@email.com',
      documento: '11223344',
      telefono: '555-0112',
      nacionalidad: 'Bolivia',
      genero: 'Masculino',
      activo: true
    },
    {
      id: 13,
      nombre: 'Valentina',
      apellido: 'Hernández',
      email: 'valentina.hernandez@email.com',
      documento: '99887766',
      telefono: '555-0113',
      nacionalidad: 'Paraguay',
      genero: 'Femenino',
      activo: true
    },
    {
      id: 14,
      nombre: 'Sebastián',
      apellido: 'Ruiz',
      email: 'sebastian.ruiz@email.com',
      documento: '88776655',
      telefono: '555-0114',
      nacionalidad: 'Panamá',
      genero: 'Masculino',
      activo: true
    },
    {
      id: 15,
      nombre: 'Camila',
      apellido: 'Vargas',
      email: 'camila.vargas@email.com',
      documento: '77665544',
      telefono: '555-0115',
      nacionalidad: 'Costa Rica',
      genero: 'Femenino',
      activo: false
    }
  ]);

  // Estados para los filtros y paginación
  const [filtros, setFiltros] = useState({
    busqueda: '',
    nacionalidad: '',
    genero: '',
    estado: ''
  });

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

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
        turista.documento.includes(filtros.busqueda);

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
                  <td>{turista.documento}</td>
                  <td>{turista.telefono}</td>
                  <td>
                    <span className="badge badge-pais">{turista.nacionalidad}</span>
                  </td>
                  <td>
                    <span className="badge badge-genero">{turista.genero}</span>
                  </td>
                  <td>
                    <span className={`badge ${turista.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                      {turista.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-buttons">
                      <button className="btn-editar" title="Editar turista">
                        ✏️ Editar
                      </button>
                      <button
                        className={`btn-toggle ${turista.activo ? 'btn-desactivar' : 'btn-activar'}`}
                        title={turista.activo ? 'Desactivar turista' : 'Activar turista'}
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
    </div>
  );
};

export default ListarTuristasTable;
