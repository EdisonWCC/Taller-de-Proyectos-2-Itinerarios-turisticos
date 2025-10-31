import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GrupoSelector from '../Itinerario/GrupoSelector';
import FormularioDatosItinerario from '../Itinerario/FormularioDatosItinerario';
import ItinerarioProgramasSelector from '../Itinerario/ItinerarioProgramasSelector';
import ItinerarioTuristasSelector from '../Itinerario/ItinerarioTuristasSelector';
import TransporteDetalle from '../Itinerario/TransporteDetalle';
import DetalleMachuForm from '../Itinerario/DetalleMachuForm';
import '../../styles/Admin/ListarItinerarios/EditarItinerario.css';

const EditarItinerario = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Estado para manejar los datos del formulario
  const [formData, setFormData] = useState({
    grupo: {
      nombre_grupo: '',
      descripcion: ''
    },
    datosItinerario: {
      fecha_inicio: '',
      fecha_fin: '',
      estado_presupuesto_id: 1
    },
    turistas: [],
    programas: [],
    transportes: [],
    detallesMachu: []
  });

  // Determinar si hay programas de Machu Picchu
  const hasMachuPicchuPrograms = formData.programas?.some(programa => 
    programa.programa_info?.tipo?.toLowerCase().includes('machu') ||
    programa.programa_info?.nombre?.toLowerCase().includes('machu')
  ) || false;
  
  // Manejar cambios en los detalles de Machu Picchu (memoizado con useCallback)
  const handleDetallesMachuChange = useCallback((detalles) => {
    setFormData(prev => ({
      ...prev,
      detallesMachu: detalles
    }));
  }, []); // Dependencias vacías ya que no necesitamos que se vuelva a crear
  
  // En modo edición, siempre mostramos el paso de Machu Picchu
  const showMachuPicchuStep = editMode || hasMachuPicchuPrograms;

  // Función para manejar la finalización de cada paso
  const handleStepComplete = (step, data) => {
    setFormData(prev => ({
      ...prev,
      ...(step === 0 && { grupo: data }),
      ...(step === 1 && { datosItinerario: data }),
      ...(step === 2 && { turistas: data }),
      ...(step === 3 && { programas: data }),
      ...(step === 4 && { transportes: data }),
      ...(step === 5 && { detallesMachu: data })
    }));

    if (step < 5) {
      setCurrentStep(step + 1);
    } else {
      // Todos los pasos completados
      handleSubmit();
    }
  };

  // Cargar datos del estado de navegación
  useEffect(() => {
    loadItinerarioData();
  }, [id, state, navigate]);

  // Función para extraer detalles de Machu Picchu de los programas
  const extraerDetallesMachu = (programas) => {
    if (!Array.isArray(programas)) return [];
    
    return programas
      .filter(programa => 
        programa.programa_info?.tipo === 'machupicchu' || 
        programa.programa_info?.nombre?.toLowerCase().includes('machu')
      )
      .map(programa => ({
        id_itinerario_programa: programa.id,
        ...(programa.detalles_machupicchu || {})
      }));
  };

  // Función para cargar los datos del itinerario
  const loadItinerarioData = async () => {
    setLoading(true);
    try {
      if (state?.itinerario) {
        const data = state.itinerario;
        const transportes = Array.isArray(data.transportes) ? data.transportes : [];
        const programas = Array.isArray(data.programas) ? data.programas : [];
        
        // Extraer detalles de Machu Picchu de los programas
        const detallesMachu = extraerDetallesMachu(programas);
      
        setFormData({
          grupo: data.grupo || null,
          datosItinerario: {
            fecha_inicio: data.fecha_inicio || '',
            fecha_fin: data.fecha_fin || '',
            estado_presupuesto_id: data.estado_presupuesto_id || 1
          },
          turistas: data.turistas || [],
          programas: programas,
          transportes: transportes,
          detallesMachu: detallesMachu
        });
      } else {
        toast.error('No se encontraron datos del itinerario');
        navigate('/admin/itinerarios');
      }
    } catch (error) {
      console.error('Error cargando el itinerario:', error);
      toast.error('Error al cargar el itinerario');
      navigate('/admin/itinerarios');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar los cambios
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Aquí iría la lógica para enviar los datos a la API
      console.log('Datos a guardar:', formData);
      
      // Simulamos un retraso de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Itinerario guardado correctamente');
      // Redirigir a la lista de itinerarios del administrador después de guardar
      navigate('/admin/itinerarios');
    } catch (error) {
      console.error('Error al guardar el itinerario:', error);
      toast.error('Error al guardar el itinerario');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar el paso actual
  const renderStep = () => {
    if (loading) {
      return <div className="editar-itinerario-loading">Cargando itinerario...</div>;
    }

    // Pasar la propiedad editMode a los componentes hijos
    const commonProps = {
      isReadOnly: !editMode
    };

    switch (currentStep) {
      case 0: // Selección de grupo
        return (
          <GrupoSelector
            initialData={{
              nombre_grupo: formData.grupo?.nombre_grupo || '',
              descripcion: formData.grupo?.descripcion || ''
            }}
            onNext={(data) => handleStepComplete(0, { ...formData.grupo, ...data })}
            isReadOnly={!editMode}
          />
        );
      case 1: // Selección de  itinerario
        return (
          <FormularioDatosItinerario
            initialData={formData.datosItinerario}
            grupoSeleccionado={formData.grupo}
            onNext={(data) => handleStepComplete(1, data)}
            onDataChange={(data) => setFormData(prev => ({ ...prev, datosItinerario: data }))}
            isReadOnly={!editMode}
          />
        );
      case 2: // Datos del turistas
        return (
         <ItinerarioTuristasSelector
          grupoId={formData.grupo?.id}
          initialTuristas={formData.turistas}
          onTuristasChange={(turistas) => setFormData(prev => ({ ...prev, turistas }))}
          isReadOnly={!editMode}
        />
        );
      case 3: // Programas
        return (
          <ItinerarioProgramasSelector
            initialData={formData.programas || []}
            onProgramasChange={(programas) => setFormData(prev => ({ ...prev, programas }))}
            isReadOnly={!editMode}
          />
        );
      case 4: // Transporte
        return (
            <TransporteDetalle
              initialData={formData.transportes || []}
              programasData={formData.programas || []}
              onTransportesChange={(transportes) => setFormData(prev => ({ ...prev, transportes }))}
              isReadOnly={!editMode}
            />
        );
     case 5: // Machu Picchu (siempre visible en modo edición)
        return (
          <DetalleMachuForm
            initialData={formData.detallesMachu || []}
            programasData={formData.programas || []}
            onDetallesChange={handleDetallesMachuChange}
            isReadOnly={!editMode}
            showEmptyState={!hasMachuPicchuPrograms}
          />
        );
      default:
        return null;
    }
  };

  // Función para ir al siguiente paso
  const nextStep = () => {
    if (currentStep < maxStep) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  // Función para ir al paso anterior
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  // Función para activar el modo edición
  const handleEditClick = () => {
    setEditMode(true);
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditMode(false);
    // Recargar los datos originales si es necesario
    loadItinerarioData();
  };

  // Calcular el paso máximo - ahora son 6 pasos (0-5)
  const maxStep = 5; // 0: Grupo, 1: Datos, 2: Turistas, 3: Programas, 4: Transporte, 5: Machu Picchu

  // Determinar si el botón de guardar debe estar habilitado (solo en el último paso)
  const isSaveButtonDisabled = currentStep < maxStep;

  return (
    <div className="editar-itinerario-container">
      <div className="editar-itinerario-header">
        <h1>Editar Itinerario #{id}</h1>
        <div className="editar-itinerario-actions">
          {!editMode ? (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/admin/itinerarios')}
              >
                Volver
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleEditClick}
              >
                Editar Itinerario
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancelar Edición
              </button>
              <button 
                className={`btn btn-primary ${isSaveButtonDisabled ? 'btn-disabled' : ''}`}
                onClick={handleSubmit}
                disabled={isSaveButtonDisabled || loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
     <div className="editar-itinerario-progress">
  {[0, 1, 2, 3, 4, 5].map((step) => (
    <div 
      key={step}
      className={`progress-step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''} ${step === 5 && !hasMachuPicchuPrograms ? 'disabled-step' : ''}`}
      onClick={() => currentStep > step && setCurrentStep(step)}
      title={step === 5 && !hasMachuPicchuPrograms ? 'No hay programas de Machu Picchu configurados' : ''}
    >
      <div className="step-number">{step + 1}</div>
      <div className="step-label">
        {step === 0 && 'Grupo'}
        {step === 1 && 'Datos'}
        {step === 2 && 'Turistas'}
        {step === 3 && 'Programas'}
        {step === 4 && 'Transporte'}
        {step === 5 && 'Machu Picchu'}
      </div>
    </div>
  ))}
</div>

      {/* Contenido del paso actual */}
      <div className="editar-itinerario-content">
        {renderStep()}
      </div>

      {/* Navegación - Solo visible en modo edición */}
      {editMode && (
        <div className="editar-itinerario-navigation">
          {currentStep > 1 && (
            <button 
              className="btn btn-outline" 
              onClick={prevStep}
              disabled={loading}
            >
              Anterior
            </button>
          )}
          {currentStep < maxStep && (
            <button 
              className="btn btn-primary" 
              onClick={nextStep}
              disabled={loading}
            >
              Siguiente
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EditarItinerario;
