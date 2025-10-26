import React, { useState, useRef, useEffect, useMemo } from 'react';
import GrupoSelector from '../../../components/Itinerario/GrupoSelector';
import FormularioDatosItinerario from '../../../components/Itinerario/FormularioDatosItinerario';
import ItinerarioTuristasSelector from '../../../components/Itinerario/ItinerarioTuristasSelector';
import ItinerarioProgramasSelector from '../../../components/Itinerario/ItinerarioProgramasSelector';
import TransporteDetalle from '../../../components/Itinerario/TransporteDetalle';
import DetalleMachuForm from '../../../components/Itinerario/DetalleMachuForm';
import ResumenFinal from '../../../components/Itinerario/ResumenFinal';
import '../../../styles/Admin/Itinerario/WizardItinerario.css';

export default function ItinerarioCreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const datosItinerarioRef = useRef(null);
  const turistasSelectorRef = useRef(null);
  const programasSelectorRef = useRef(null);
  const transporteDetalleRef = useRef(null);
  const machuDetalleRef = useRef(null);
  const [formData, setFormData] = useState({
    grupo: null,
    datosItinerario: {
      fecha_inicio: '',
      fecha_fin: '',
      estado_presupuesto_id: 1
    },
    turistas: [],
    programas: [],
    transportes: [],
    detallesMachu: [],
    resumen: {}
  });

  // Calcular dinámicamente si hay programas de Machu Picchu
  const hasMachuPicchuPrograms = useMemo(() => {
    return formData.programas.some(programa =>
      programa.programa_info?.tipo === 'machupicchu'
    );
  }, [formData.programas]);

  const updateFormData = (step, data) => {
    setFormData(prev => ({ ...prev, [step]: data }));
  };

  const handleGrupoNext = (data) => {
    setFormData(prev => ({
      ...prev,
      grupo: data.grupo
    }));
    setCurrentStep(2);
  };

  const handleProgramasNext = (data) => {
    console.log('ItinerarioCreatePage - handleProgramasNext ejecutándose con data:', data);
    setFormData(prev => ({
      ...prev,
      programas: data
    }));

    // Si hay programas de Machu Picchu, ir al paso 6 (transporte), sino al paso 7 (resumen)
    if (hasMachuPicchuPrograms) {
      setCurrentStep(5);
    } else {
      setCurrentStep(7);
    }
  };

  const handleProgramasBack = (data) => {
    console.log('ItinerarioCreatePage - handleProgramasBack ejecutándose con data:', data);
    setFormData(prev => ({
      ...prev,
      programas: data
    }));
    setCurrentStep(3); // Volver al paso de turistas
  };

  const handleProgramasChange = (nuevosProgramas) => {
    console.log('ItinerarioCreatePage - Programas cambiados:', nuevosProgramas);
    setFormData(prev => ({
      ...prev,
      programas: nuevosProgramas
    }));
  };

  const nextStep = () => {
    if (currentStep === 2 && datosItinerarioRef.current) {
      // Validar y obtener datos del formulario de datos del itinerario
      if (datosItinerarioRef.current.validate()) {
        const data = datosItinerarioRef.current.getData();
        setFormData(prev => ({
          ...prev,
          datosItinerario: data
        }));
        setCurrentStep(3);
      }
      return;
    }

    if (currentStep === 3 && turistasSelectorRef.current) {
      // Validar y obtener datos del selector de turistas
      if (turistasSelectorRef.current.validate()) {
        const data = turistasSelectorRef.current.getData();
        setFormData(prev => ({
          ...prev,
          turistas: data
        }));
        setCurrentStep(4);
      }
      return;
    }

    if (currentStep === 4) {
      // Validar y obtener datos del selector de programas
      if (programasSelectorRef.current && programasSelectorRef.current.validate()) {
        const data = programasSelectorRef.current.getData();
        console.log('ItinerarioCreatePage - Datos del paso 4 obtenidos:', data);

        setFormData(prev => ({
          ...prev,
          programas: data
        }));

        // Si hay programas de Machu Picchu, ir al paso 6 (transporte), sino al paso 7 (resumen)
        if (hasMachuPicchuPrograms) {
          setCurrentStep(5);
        } else {
          setCurrentStep(7);
        }
      } else {
        console.log('ItinerarioCreatePage - Validación del paso 4 falló');
        // Mostrar mensaje de error o mantener en el mismo paso
        alert('Por favor selecciona al menos un programa antes de continuar');
      }
      return;
    }

    if (currentStep === 5) {
      // Guardar datos de TransporteDetalle antes de continuar
      if (transporteDetalleRef.current) {
        const data = transporteDetalleRef.current.getData();
        setFormData(prev => ({
          ...prev,
          transportes: data
        }));
      }

      // Si hay programas de Machu Picchu, ir al paso 6, sino al paso 7 (resumen)
      if (hasMachuPicchuPrograms) {
        setCurrentStep(6);
      } else {
        setCurrentStep(7);
      }
      return;
    }

    if (currentStep === 6) {
      // Guardar datos de DetalleMachuForm antes de continuar
      if (machuDetalleRef.current) {
        const data = machuDetalleRef.current.getData();
        setFormData(prev => ({
          ...prev,
          detallesMachu: data
        }));
      }

      // Ir al resumen (paso 7)
      setCurrentStep(7);
      return;
    }

    // Si no hay lógica específica, navegar al siguiente paso
    const totalSteps = hasMachuPicchuPrograms ? 7 : 6;
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep === 2) {
      // Para el paso 2, solo actualizamos los datos sin navegación especial
      if (datosItinerarioRef.current) {
        const data = datosItinerarioRef.current.getData();
        setFormData(prev => ({
          ...prev,
          datosItinerario: data
        }));
      }
    }

    if (currentStep === 4) {
      // Para el paso 4 (Programas), guardamos los datos antes de ir al paso anterior
      if (programasSelectorRef.current) {
        const data = programasSelectorRef.current.getData();
        setFormData(prev => ({
          ...prev,
          programas: data
        }));
      }
    }

    if (currentStep === 5) {
      // Guardar datos de TransporteDetalle antes de volver al paso anterior
      if (transporteDetalleRef.current) {
        const data = transporteDetalleRef.current.getData();
        setFormData(prev => ({
          ...prev,
          transportes: data
        }));
      }
      setCurrentStep(4); // Volver al paso de programas
      return;
    }

    if (currentStep === 6) {
      // Guardar datos de DetalleMachuForm antes de ir al paso anterior
      if (machuDetalleRef.current) {
        const data = machuDetalleRef.current.getData();
        setFormData(prev => ({
          ...prev,
          detallesMachu: data
        }));
      }
      setCurrentStep(5); // Volver al transporte
      return;
    }

    if (currentStep === 7) {
      // Si estamos en el resumen (paso 7), guardar datos antes de volver
      if (hasMachuPicchuPrograms) {
        // Si hay Machu Picchu, volver al paso 6 (Machu Picchu)
        if (machuDetalleRef.current) {
          const data = machuDetalleRef.current.getData();
          setFormData(prev => ({
            ...prev,
            detallesMachu: data
          }));
        }
        setCurrentStep(6);
      } else {
        // Si no hay Machu Picchu, volver al paso 5 (Transporte)
        if (transporteDetalleRef.current) {
          const data = transporteDetalleRef.current.getData();
          setFormData(prev => ({
            ...prev,
            transportes: data
          }));
        }
        setCurrentStep(5);
      }
      return;
    }

    // Si no hay lógica específica, navegar al paso anterior
    const totalSteps = hasMachuPicchuPrograms ? 7 : 6;
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinalSubmit = async (finalData) => {
    try {
      // TODO: Implementar API call para crear el itinerario completo
      console.log('Creando itinerario con datos:', {
        ...formData,
        ...finalData
      });

      // Aquí iría la llamada a la API:
      // POST /api/itinerarios con todos los datos

      // Mostrar alerta de éxito mejorada
      const itinerarioInfo = `📋 ${formData.grupo?.nombre_grupo || 'Itinerario'}\n` +
                           `👤 ${formData.turistas?.length || 0} turistas\n` +
                           `🎯 ${formData.programas?.length || 0} actividades\n` +
                           `🚌 ${formData.transportes?.length || 0} transportes\n` +
                           `${formData.detallesMachu?.length > 0 ? `🏔️ ${formData.detallesMachu?.length} detalles Machu Picchu\n` : ''}` +
                           `✅ ¡Itinerario creado exitosamente!`;

      alert(itinerarioInfo);

      // Resetear el formulario y volver al paso 1
      setCurrentStep(1);
      setFormData({
        grupo: null,
        datosItinerario: { fecha_inicio: '', fecha_fin: '', estado_presupuesto_id: 1 },
        turistas: [],
        programas: [],
        transportes: [],
        detallesMachu: [],
        resumen: {}
      });

    } catch (error) {
      console.error('Error creando itinerario:', error);
      alert('Error al crear el itinerario. Por favor, inténtalo de nuevo.');
    }
  };

  // Efecto para actualizar datos en componentes cuando cambian los pasos
  useEffect(() => {
    if (currentStep === 2 && datosItinerarioRef.current) {
      // Actualizar datos del formulario cuando volvemos al paso 2
      datosItinerarioRef.current.updateData?.(formData.datosItinerario);
    }
  }, [currentStep, formData.datosItinerario]);

  // Efecto para sincronizar programas desde el componente hijo
  useEffect(() => {
    // Este efecto se ejecutará cuando el componente hijo actualice sus datos
    // Pero necesitamos que el componente hijo notifique al padre
    console.log('ItinerarioCreatePage - useEffect ejecutado, formData actualizado:', formData);
  }, [formData]);

  return (
    <div className="wizard-wrapper">
      {/* Header del Wizard */}
      <div className="wizard-header">
        <h1>🏖️ Crear Nuevo Itinerario</h1>
        <div className="progress-indicator">
          <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>Grupo</div>
          <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>Datos</div>
          <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>Turistas</div>
          <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}>Programas</div>
          <div className={`step-indicator ${currentStep >= 5 ? 'active' : ''}`}>Transporte</div>
          {hasMachuPicchuPrograms && (
            <div className={`step-indicator ${currentStep >= 6 ? 'active' : ''}`}>Machu Picchu</div>
          )}
          <div className={`step-indicator ${currentStep >= (hasMachuPicchuPrograms ? 7 : 6) ? 'active' : ''}`}>Resumen</div>
        </div>
      </div>

      {/* Contenido del Wizard */}
      <div className="wizard-content">
        {currentStep === 1 && <GrupoSelector onNext={handleGrupoNext} />}
        {currentStep === 2 && (
          <FormularioDatosItinerario
            ref={datosItinerarioRef}
            initialData={formData.datosItinerario}
            grupoSeleccionado={formData.grupo}
          />
        )}
        {currentStep === 3 && (
          <ItinerarioTuristasSelector
            ref={turistasSelectorRef}
            initialData={formData.turistas}
            itinerarioData={formData.datosItinerario}
          />
        )}
        {currentStep === 4 && (
          <ItinerarioProgramasSelector
            ref={programasSelectorRef}
            onNext={handleProgramasNext}
            onBack={handleProgramasBack}
            initialData={formData.programas}
            itinerarioData={formData.datosItinerario}
            onProgramasChange={handleProgramasChange}
          />
        )}
        {currentStep === 5 && (
          <TransporteDetalle
            ref={transporteDetalleRef}
            initialData={formData.transportes}
            itinerarioData={formData.datosItinerario}
            programasData={formData.programas}
          />
        )}
        {currentStep === 6 && hasMachuPicchuPrograms && (
          <DetalleMachuForm
            ref={machuDetalleRef}
            initialData={formData.detallesMachu}
            programasData={formData.programas}
          />
        )}
        {currentStep === (hasMachuPicchuPrograms ? 7 : 6) && (
          <ResumenFinal data={formData} onSubmit={handleFinalSubmit} />
        )}
      </div>

      {/* Navegación */}
      {currentStep > 1 && (
        <div className="wizard-actions">
          <button className="btn btn-secondary" onClick={prevStep}>
            ← Anterior
          </button>

          <div className="step-info">
            Paso {currentStep} de {hasMachuPicchuPrograms ? 7 : 6}
          </div>

          {currentStep < (hasMachuPicchuPrograms ? 7 : 6) ? (
            <button className="btn btn-primary" onClick={nextStep}>
              Siguiente →
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleFinalSubmit}>
              ✅ Crear Itinerario
            </button>
          )}
        </div>
      )}
    </div>
  );
}