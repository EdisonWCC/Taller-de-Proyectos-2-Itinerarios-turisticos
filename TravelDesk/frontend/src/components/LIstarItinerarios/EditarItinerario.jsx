import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GrupoSelector from '../Itinerario/GrupoSelector';
import FormularioDatosItinerario from '../Itinerario/FormularioDatosItinerario';
import ItinerarioProgramasSelector from '../Itinerario/ItinerarioProgramasSelector';
import TransporteDetalle from '../Itinerario/TransporteDetalle';
import DetalleMachuForm from '../Itinerario/DetalleMachuForm';
import ResumenFinal from '../Itinerario/ResumenFinal';
import '../../styles/Admin/ListarItinerarios/EditarItinerario.css';

// Datos de prueba
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
  ],
  transportes: [
    {
      id: 1,
      tipo: 'bus',
      descripcion: 'Bus turístico',
      fecha: '2025-11-02',
      hora_salida: '08:00',
      hora_llegada: '09:00'
    }
  ],
  detallesMachu: []
};

const EditarItinerario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Refs para los componentes del formulario
  const datosItinerarioRef = useRef(null);
  const programasSelectorRef = useRef(null);
  const transporteDetalleRef = useRef(null);
  const machuDetalleRef = useRef(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    grupo: null,
    datosItinerario: {
      fecha_inicio: '',
      fecha_fin: '',
      estado_presupuesto_id: 1
    },
    programas: [],
    transportes: [],
    detallesMachu: []
  });

  // Cargar datos de prueba
  useEffect(() => {
    setLoading(true);
    // Simular carga de datos
    const timer = setTimeout(() => {
      setFormData({
        grupo: mockItinerario.grupo,
        datosItinerario: {
          fecha_inicio: mockItinerario.fecha_inicio,
          fecha_fin: mockItinerario.fecha_fin,
          estado_presupuesto_id: mockItinerario.estado_presupuesto_id
        },
        programas: mockItinerario.programas,
        transportes: mockItinerario.transportes,
        detallesMachu: mockItinerario.detallesMachu
      });
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);

  // Manejar cambios en los datos del formulario
  const updateFormData = (step, data) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  // Navegación entre pasos
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Validar el paso actual
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Datos del itinerario
        return datosItinerarioRef.current?.validate() || false;
      case 2: // Programas
        return programasSelectorRef.current?.validate() || false;
      // Agregar validaciones para otros pasos si es necesario
      default:
        return true;
    }
  };

  // Simular guardado de cambios
  const handleSave = () => {
    // Simular tiempo de guardado
    setLoading(true);
    setTimeout(() => {
      console.log('Datos a guardar:', {
        ...formData.datosItinerario,
        id_grupo: formData.grupo?.id,
        programas: formData.programas,
        transportes: formData.transportes,
        detallesMachu: formData.detallesMachu
      });
      
      toast.success('Cambios guardados correctamente (simulado)');
      setLoading(false);
      
      // Opcional: Redirigir después de guardar
      // navigate('/admin/itinerarios');
    }, 1000);
  };

  // Renderizar el paso actual
  const renderStep = () => {
    if (loading) {
      return <div className="editar-itinerario-loading">Cargando itinerario...</div>;
    }

    switch (currentStep) {
      case 1:
        return (
          <FormularioDatosItinerario
            ref={datosItinerarioRef}
            initialData={formData.datosItinerario}
            grupoSeleccionado={formData.grupo}
            onDataChange={(data) => updateFormData('datosItinerario', data)}
          />
        );
      case 2:
        return (
          <ItinerarioProgramasSelector
            initialProgramas={formData.programas}
            onProgramasChange={(programas) => updateFormData('programas', programas)}
          />
        );
      case 3:
        return (
          <TransporteDetalle
            ref={transporteDetalleRef}
            initialTransportes={formData.transportes}
            onTransportesChange={(transportes) => updateFormData('transportes', transportes)}
          />
        );
      case 4:
        return (
          <DetalleMachuForm
            ref={machuDetalleRef}
            initialDetalles={formData.detallesMachu}
            onDetallesChange={(detalles) => updateFormData('detallesMachu', detalles)}
          />
        );
      case 5:
        return (
          <ResumenFinal
            formData={formData}
            onConfirm={handleSave}
          />
        );
      default:
        return null;
    }
  };

  // Determinar si hay programas de Machu Picchu
  const hasMachuPicchuPrograms = formData.programas.some(
    programa => programa.programa_info?.tipo === 'machupicchu'
  );

  // Calcular el paso máximo basado en si hay programas de Machu Picchu
  const maxStep = hasMachuPicchuPrograms ? 5 : 4;

  // Determinar si el botón de guardar debe estar habilitado
  const isSaveButtonDisabled = currentStep < maxStep;

  return (
    <div className="editar-itinerario-container">
      <div className="editar-itinerario-header">
        <h1>Editar Itinerario #{id}</h1>
        <div className="editar-itinerario-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin/itinerarios')}
          >
            Cancelar
          </button>
          <button 
            className={`btn btn-primary ${isSaveButtonDisabled ? 'btn-disabled' : ''}`}
            onClick={handleSave}
            disabled={isSaveButtonDisabled}
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="editar-itinerario-progress">
        {[1, 2, 3, 4, 5].map((step) => {
          if (step === 5 && !hasMachuPicchuPrograms) return null;
          
          return (
            <div 
              key={step}
              className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              onClick={() => currentStep > step && setCurrentStep(step)}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Datos'}
                {step === 2 && 'Programas'}
                {step === 3 && 'Transporte'}
                {step === 4 && (hasMachuPicchuPrograms ? 'Machu Picchu' : 'Resumen')}
                {step === 5 && 'Resumen'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido del paso actual */}
      <div className="editar-itinerario-content">
        {renderStep()}
      </div>

      {/* Navegación */}
      <div className="editar-itinerario-navigation">
        {currentStep > 1 && (
          <button className="btn btn-outline" onClick={prevStep}>
            Anterior
          </button>
        )}
        {currentStep < maxStep ? (
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

export default EditarItinerario;
