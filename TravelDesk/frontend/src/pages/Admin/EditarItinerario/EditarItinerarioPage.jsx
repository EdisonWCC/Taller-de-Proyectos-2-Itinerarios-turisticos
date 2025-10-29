import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../styles/Admin/EditarItinerario/EditarItinerarioPage.css';

// Mock data
const mockItinerario = {
  id: 1,
  grupo: {
    id: 1,
    nombre_grupo: 'Grupo de Prueba',
    cantidad_personas: 5
  },
  fecha_inicio: '2025-11-01',
  fecha_fin: '2025-11-10',
  estado_presupuesto_id: 1,
  estado_presupuesto: 'Pendiente',
  programas: [
    {
      id: 1,
      fecha: '2025-11-02',
      hora_inicio: '09:00',
      hora_fin: '13:00',
      programa_info: {
        id: 1,
        nombre: 'City Tour Cusco',
        tipo: 'tour',
        descripcion: 'Recorrido por los principales atractivos de Cusco'
      }
    }
  ]
};

const EditarItinerarioPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    grupo: null,
    datosItinerario: {
      fecha_inicio: '',
      fecha_fin: '',
      estado_presupuesto_id: 1
    },
    programas: []
  });

  // Load mock data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setFormData({
        grupo: mockItinerario.grupo,
        datosItinerario: {
          fecha_inicio: mockItinerario.fecha_inicio,
          fecha_fin: mockItinerario.fecha_fin,
          estado_presupuesto_id: mockItinerario.estado_presupuesto_id
        },
        programas: mockItinerario.programas
      });
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const updateFormData = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      console.log('Datos guardados:', formData);
      toast.success('Cambios guardados correctamente');
      setLoading(false);
    }, 1000);
  };

  const renderStep = () => {
    if (loading) {
      return <div className="loading">Cargando datos del itinerario...</div>;
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3>Información General</h3>
            <div className="form-group">
              <label>Grupo</label>
              <input 
                type="text" 
                value={formData.grupo?.nombre_grupo || ''} 
                className="form-control" 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Fecha de Inicio</label>
              <input 
                type="date" 
                value={formData.datosItinerario.fecha_inicio} 
                className="form-control" 
                onChange={(e) => updateFormData('datosItinerario', {
                  ...formData.datosItinerario,
                  fecha_inicio: e.target.value
                })} 
              />
            </div>
            <div className="form-group">
              <label>Fecha de Fin</label>
              <input 
                type="date" 
                value={formData.datosItinerario.fecha_fin} 
                className="form-control" 
                onChange={(e) => updateFormData('datosItinerario', {
                  ...formData.datosItinerario,
                  fecha_fin: e.target.value
                })} 
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h3>Programas</h3>
            {formData.programas.map((programa, index) => (
              <div key={index} className="programa-item">
                <h4>{programa.programa_info.nombre}</h4>
                <p>{programa.fecha} - {programa.hora_inicio} a {programa.hora_fin}</p>
                <p>{programa.programa_info.descripcion}</p>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="form-section">
            <h3>Resumen</h3>
            <div className="summary">
              <h4>Detalles del Itinerario</h4>
              <p><strong>Grupo:</strong> {formData.grupo?.nombre_grupo}</p>
              <p><strong>Fecha Inicio:</strong> {formData.datosItinerario.fecha_inicio}</p>
              <p><strong>Fecha Fin:</strong> {formData.datosItinerario.fecha_fin}</p>
              <p><strong>Programas:</strong> {formData.programas.length}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="editar-itinerario-container">
      <h1>Editar Itinerario #{mockItinerario.id}</h1>
      
      <div className="progress-steps">
        {[1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={`step ${currentStep >= step ? 'active' : ''}`}
            onClick={() => currentStep < step && setCurrentStep(step)}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Información'}
              {step === 2 && 'Programas'}
              {step === 3 && 'Resumen'}
            </div>
          </div>
        ))}
      </div>

      <div className="form-container">
        {renderStep()}
      </div>

      <div className="form-actions">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={prevStep}>
            Anterior
          </button>
        )}
        {currentStep < 3 ? (
          <button className="btn btn-primary" onClick={nextStep}>
            Siguiente
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSave}>
            Guardar Cambios
          </button>
        )}
      </div>
    </div>
  );
};

export default EditarItinerarioPage;
