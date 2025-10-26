import React from 'react';
import '../../styles/Admin/Itinerario/WizardItinerario.css';

const ItinerarioSuccessModal = ({ isOpen, onClose, itinerarioData }) => {
  if (!isOpen) return null;

  return (
    <div className="wizard-success-modal-overlay" onClick={onClose}>
      <div className="wizard-success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-success-modal-header">
          <div className="wizard-success-icon">
            ✅
          </div>
          <h2>¡Itinerario Creado Exitosamente!</h2>
          <button
            className="wizard-success-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="wizard-success-modal-body">
          <div className="wizard-success-summary">
            <div className="wizard-success-summary-item">
              <span className="wizard-success-label">📋 Itinerario:</span>
              <span className="wizard-success-value">{itinerarioData?.nombre}</span>
            </div>

            <div className="wizard-success-summary-item">
              <span className="wizard-success-label">👥 Grupo:</span>
              <span className="wizard-success-value">{itinerarioData?.grupo?.nombre_grupo}</span>
            </div>

            <div className="wizard-success-summary-item">
              <span className="wizard-success-label">📅 Fechas:</span>
              <span className="wizard-success-value">
                {itinerarioData?.datosItinerario?.fecha_inicio} al {itinerarioData?.datosItinerario?.fecha_fin}
              </span>
            </div>

            <div className="wizard-success-summary-item">
              <span className="wizard-success-label">👤 Turistas:</span>
              <span className="wizard-success-value">{itinerarioData?.turistas?.length || 0} personas</span>
            </div>

            <div className="wizard-success-summary-item">
              <span className="wizard-success-label">🎯 Programas:</span>
              <span className="wizard-success-value">{itinerarioData?.programas?.length || 0} actividades</span>
            </div>

            <div className="wizard-success-summary-item">
              <span className="wizard-success-label">🚌 Transportes:</span>
              <span className="wizard-success-value">{itinerarioData?.transportes?.length || 0} asignados</span>
            </div>

            {itinerarioData?.detallesMachu?.length > 0 && (
              <div className="wizard-success-summary-item">
                <span className="wizard-success-label">🏔️ Machu Picchu:</span>
                <span className="wizard-success-value">{itinerarioData?.detallesMachu?.length} detalles configurados</span>
              </div>
            )}
          </div>

          <div className="wizard-success-actions">
            <button
              className="btn btn-primary wizard-success-btn"
              onClick={onClose}
            >
              Crear Otro Itinerario
            </button>
            <button
              className="btn btn-secondary wizard-success-btn"
              onClick={() => {
                onClose();
                // Aquí podrías redirigir a la lista de itinerarios
                // navigate('/admin/itinerarios');
              }}
            >
              Ver Itinerarios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItinerarioSuccessModal;
