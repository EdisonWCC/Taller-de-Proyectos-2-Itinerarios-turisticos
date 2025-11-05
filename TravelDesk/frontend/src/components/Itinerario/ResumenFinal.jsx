import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/Admin/Itinerario/ResumenFinal.css';

const ResumenFinal = ({ data: propData, onSubmit }) => {
  const location = useLocation();
  // Use data from location.state if available, otherwise use propData
  const data = location.state?.itinerario || propData || {};
  const handleFinalSubmit = () => {
    console.log('Crear itinerario con datos:', data);
    if (!data) {
    return <div>No se encontraron datos del itinerario</div>;
  }

  if (onSubmit) {
    onSubmit(data);
  } else if (data.grupo?.nombre_grupo) {
    alert(`¡Itinerario creado exitosamente para el grupo "${data.grupo.nombre_grupo}"!`);
  }
  };

  return (
    <div className="resumen-final-container">
      <div className="resumen-final-header resumen-final-header-expanded">
        <div className="resumen-final-step-info">
          <div className="resumen-final-step-number">7</div>
          <div className="resumen-final-step-title">
            <h3>📋 Resumen del Itinerario</h3>
            <p>Revisa todos los detalles antes de crear</p>
          </div>
        </div>
      </div>

      <div className="resumen-final-content">
        <div className="resumen-final-summary-grid">
          <div className="resumen-final-summary-item">
            <h4>👥 Grupo</h4>
            <p><strong>{data.grupo?.nombre_grupo}</strong></p>
            <p>{data.grupo?.descripcion}</p>
          </div>

          <div className="resumen-final-summary-item">
            <h4>📋 Datos del Itinerario</h4>
            <p><strong>Fechas:</strong> {data.fecha_inicio || 'No especificada'} al {data.fecha_fin || 'No especificada'}</p>
            <p><strong>Estado del Presupuesto:</strong> {data.estado_presupuesto || 'No especificado'}</p>
          </div>

          <div className="resumen-final-summary-item">
            <h4>👤 Turistas Seleccionados ({data.turistas?.length || 0})</h4>
            {data.turistas && data.turistas.length > 0 ? (
              <div className="resumen-final-turistas-section">
                {data.turistas.slice(0, 3).map((turista, index) => (
                  <div key={turista.id_turista} className="resumen-final-turista-item">
                    <span className="resumen-final-turista-nombre">{turista.nombre} {turista.apellido}</span>
                    <span className="resumen-final-turista-dni">DNI: {turista.dni || 'N/A'}</span>
                  </div>
                ))}
                {data.turistas.length > 3 && (
                  <p className="resumen-final-more-turistas">... y {data.turistas.length - 3} turistas más</p>
                )}
              </div>
            ) : (
              <p className="resumen-final-no-turistas">No hay turistas seleccionados</p>
            )}
          </div>

          <div className="resumen-final-summary-item">
            <h4>🎯 Programas Seleccionados ({data.programas?.length || 0})</h4>
            {data.programas && data.programas.length > 0 ? (
              <div className="resumen-final-programas-section">
                {data.programas.map((item, index) => (
                  <div key={item.id_itinerario_programa} className="resumen-final-programa-item">
                    <div className="resumen-final-programa-info">
                      <span className="resumen-final-programa-nombre">{item.programa_info.nombre}</span>
                      <span className="resumen-final-programa-tipo">🏷️ {item.programa_info.tipo}</span>
                      <span className="resumen-final-programa-fecha">📅 {item.fecha} ({item.hora_inicio}-{item.hora_fin})</span>
                      <span className="resumen-final-programa-costo">💰 S/ {item.programa_info.costo}</span>
                    </div>
                  </div>
                ))}
                <div className="resumen-final-costo-total">
                  <strong>Costo Total: S/ {data.programas.reduce((total, p) => total + parseFloat(p.programa_info.costo), 0).toFixed(2)}</strong>
                </div>
              </div>
            ) : (
              <p className="resumen-final-no-programas">No hay programas seleccionados</p>
            )}
          </div>

          <div className="resumen-final-summary-item">
            <h4>🚌 Transportes Asignados ({data.transportes?.length || 0})</h4>
            {data.transportes && data.transportes.length > 0 ? (
              <div className="resumen-final-transportes-section">
                {data.transportes.map((transporte) => (
                  <div key={transporte.id_detalle_transporte} className="resumen-final-transporte-item">
                    <div className="resumen-final-transporte-info">
                      <span className="resumen-final-transporte-programa">
                        {transporte.programa_info?.nombre || 'Programa no especificado'}
                      </span>
                      <span className="resumen-final-transporte-empresa">
                        🚗 {transporte.transporte_info?.empresa || 'Empresa no especificada'}
                      </span>
                      <span className="resumen-final-transporte-horario">
                        🕐 {transporte.horario_recojo || 'Sin horario especificado'}
                      </span>
                      <span className="resumen-final-transporte-lugar">
                        📍 {transporte.lugar_recojo || 'Lugar no especificado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="resumen-final-no-transportes">No hay transportes asignados</p>
            )}
          </div>

          <div className="resumen-final-summary-item">
            <h4>🏔️ Detalles Machu Picchu ({data.detallesMachu?.length || 0})</h4>
            {data.detallesMachu && data.detallesMachu.length > 0 ? (
              <div className="resumen-final-machu-section">
                {data.detallesMachu.map((detalle, index) => (
                  <div key={detalle.id_itinerario_programa} className="resumen-final-machu-item">
                    <div className="resumen-final-machu-info">
                      <span className="resumen-final-machu-programa">{detalle.programa_info.nombre}</span>
                      <span className="resumen-final-machu-empresa">🚆 {detalle.empresa_tren}</span>
                      <span className="resumen-final-machu-horarios">🕐 Ida: {detalle.horario_tren_ida} | Retorno: {detalle.horario_tren_retor}</span>
                      <span className="resumen-final-machu-guia">👨‍🏫 {detalle.nombre_guia}</span>
                      <span className="resumen-final-machu-tiempo">⏱️ {detalle.tiempo_visita}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="resumen-final-no-machu">No hay detalles de Machu Picchu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenFinal;
