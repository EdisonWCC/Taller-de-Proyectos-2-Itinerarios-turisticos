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
      let data = state?.itinerario;
      if (!data) {
        const res = await fetch(`http://localhost:3000/api/itinerarios/${id}`);
        if (!res.ok) throw new Error('No se pudo cargar el itinerario');
        data = await res.json();
      }

      const transportes = Array.isArray(data.transportes) ? data.transportes : [];
      const programas = Array.isArray(data.programas) ? data.programas : [];
      const detallesMachu = extraerDetallesMachu(programas);

      const toInputDate = (val) => {
        if (!val) return '';
        try {
          const d = new Date(val);
          if (isNaN(d.getTime())) return String(val).slice(0, 10);
          const tz = d.getTimezoneOffset();
          const local = new Date(d.getTime() - tz * 60000);
          return local.toISOString().slice(0, 10);
        } catch {
          return String(val).slice(0, 10);
        }
      };

      setFormData({
        grupo: data.grupo || null,
        datosItinerario: {
          fecha_inicio: toInputDate(data.fecha_inicio),
          fecha_fin: toInputDate(data.fecha_fin),
          estado_presupuesto_id: data.estado_presupuesto_id || 1
        },
        turistas: data.turistas || [],
        programas: programas,
        transportes: transportes,
        detallesMachu: detallesMachu
      });
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
      const payload = {
        grupo: formData.grupo?.id_grupo || formData.grupo?.id ? { id_grupo: formData.grupo.id_grupo || formData.grupo.id } : null,
        datosItinerario: {
          fecha_inicio: formData.datosItinerario.fecha_inicio,
          fecha_fin: formData.datosItinerario.fecha_fin,
          estado_presupuesto_id: formData.datosItinerario.estado_presupuesto_id
        },
        turistas: Array.isArray(formData.turistas) ? formData.turistas.map(t => ({ id_turista: t.id_turista || t.id })) : [],
        programas: Array.isArray(formData.programas) ? formData.programas.map(p => ({
          id_itinerario_programa: p.id || p.id_itinerario_programa,
          fecha: p.fecha,
          hora_inicio: p.hora_inicio,
          hora_fin: p.hora_fin,
          programa_info: {
            id_programa: p.programa_info?.id_programa || p.programa_info?.id,
            nombre: p.programa_info?.nombre,
            tipo: p.programa_info?.tipo,
            descripcion: p.programa_info?.descripcion,
            duracion: p.programa_info?.duracion,
            costo: p.programa_info?.precio_persona || p.programa_info?.costo
          }
        })) : [],
        transportes: Array.isArray(formData.transportes) ? formData.transportes.map(t => ({
          id_itinerario_programa: t.id_itinerario_programa || t.programa_info?.id_itinerario_programa || t.programa_info?.id,
          id_transporte: t.id_transporte || t.transporte_info?.id_transporte,
          horario_recojo: t.horario_recojo || t.programa_info?.hora_inicio,
          lugar_recojo: t.lugar_recojo
        })) : [],
        detallesMachu: Array.isArray(formData.detallesMachu) ? formData.detallesMachu.map(m => ({
          id_itinerario_programa: m.id_itinerario_programa || m.id,
          empresa_tren: m.empresa_tren,
          horario_tren_ida: m.horario_tren_ida,
          horario_tren_retor: m.horario_tren_retor,
          nombre_guia: m.nombre_guia,
          ruta: m.ruta,
          tiempo_visita: m.tiempo_visita
        })) : []
      };

      const res = await fetch(`http://localhost:3000/api/itinerarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) throw new Error(data?.error || 'Error al guardar');

      toast.success('Itinerario guardado correctamente');
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
              id: formData.grupo?.id_grupo || formData.grupo?.id,
              nombre_grupo: formData.grupo?.nombre_grupo || '',
              descripcion: formData.grupo?.descripcion || ''
            }}
            onNext={(data) => handleStepComplete(0, data?.grupo ? data.grupo : { ...formData.grupo, ...data })}
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
            onProgramasChange={(programas) => {
              console.log('EditarItinerario - onProgramasChange received', programas);
              setFormData(prev => ({ ...prev, programas }));
            }}
            isReadOnly={!editMode}
            itinerarioId={id}
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

  // Permitir guardar desde cualquier paso cuando está en modo edición
  const isSaveButtonDisabled = false;

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
