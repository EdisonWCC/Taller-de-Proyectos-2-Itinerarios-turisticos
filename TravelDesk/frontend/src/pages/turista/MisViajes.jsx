import React, { useState, useEffect } from 'react';
import { Card, Tag, Typography, Empty, Divider, Button, Modal } from 'antd';
import { 
  CalendarOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  CarOutlined,
  HomeOutlined,
  RestOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import GenerarPDF from '../../components/GenerarPDF/GenerarPDF';
import '../../styles/Turista/turista.css';

const { Title, Text } = Typography;

// Función para generar un itinerario de ejemplo por días
const generarItinerario = (dias) => {
  const itinerario = [];
  const actividades = [
    { tipo: 'tour', icon: <CarOutlined />, color: '#1890ff' },
    { tipo: 'comida', icon: <RestOutlined />, color: '#52c41a' },
    { tipo: 'hospedaje', icon: <HomeOutlined />, color: '#722ed1' }
  ];

  for (let i = 1; i <= dias; i++) {
    const dia = {
      id: i,
      titulo: `Día ${i}`,
      fecha: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      actividades: []
    };

    // Agregar 3-5 actividades por día
    const numActividades = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < numActividades; j++) {
      const actividad = actividades[Math.floor(Math.random() * actividades.length)];
      const horas = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      
      dia.actividades.push({
        id: `${i}-${j}`,
        hora: horas[j % horas.length],
        titulo: `Actividad ${j + 1} del día ${i}`,
        descripcion: 'Descripción detallada de la actividad programada para este horario.',
        tipo: actividad.tipo,
        icono: actividad.icon,
        color: actividad.color,
        duracion: '2 horas',
        lugar: 'Lugar de la actividad',
        notas: 'Llevar cámara y ropa cómoda.'
      });
    }
    
    itinerario.push(dia);
  }
  
  return itinerario;
};

// Componente principal
const MisViajes = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null);

  const [viajes, setViajes] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    if (!token) return;

    const estadoColor = (estado) => {
      const s = (estado || '').toLowerCase();
      if (s.includes('confirm')) return 'green';
      if (s.includes('pend')) return 'orange';
      if (s.includes('rechaz') || s.includes('deneg')) return 'red';
      return 'blue';
    };

    const iconForTipo = (tipo) => {
      const t = (tipo || 'tour').toLowerCase();
      if (t === 'comida') return <RestOutlined />;
      if (t === 'hospedaje') return <HomeOutlined />;
      return <CarOutlined />;
    };

    const mapItinerario = (it) => {
      const titulo = it?.grupo?.nombre_grupo ? it.grupo.nombre_grupo : `Itinerario #${it.id}`;
      const fechaStr = `${new Date(it.fecha_inicio).toLocaleDateString()} - ${new Date(it.fecha_fin).toLocaleDateString()}`;
      const duracionDias = (() => {
        const d1 = new Date(it.fecha_inicio);
        const d2 = new Date(it.fecha_fin);
        const diff = Math.max(1, Math.round((d2 - d1) / (1000*60*60*24)) + 1);
        return `${diff} días`;
      })();

      // Agrupar programas por fecha como días
      const diasMap = new Map();
      const transpByIp = new Map();
      for (const tr of it.transportes || []) {
        const arr = transpByIp.get(tr.id_itinerario_programa) || [];
        arr.push(tr);
        transpByIp.set(tr.id_itinerario_programa, arr);
      }
      for (const p of it.programas || []) {
        const fecha = new Date(p.fecha).toLocaleDateString();
        if (!diasMap.has(fecha)) diasMap.set(fecha, []);
        const acts = diasMap.get(fecha);
        // Actividad base del programa
        acts.push({ __kind: 'programa', data: p });
        // Transportes asociados a este programa como actividades
        const trs = transpByIp.get(p.id) || transpByIp.get(p.id_itinerario_programa) || [];
        for (const t of trs) {
          acts.push({ __kind: 'transporte', data: t });
        }
        // Detalle Machu Picchu como actividad propia si existe
        if (p.detalles_machupicchu) {
          acts.push({ __kind: 'machu', data: p });
        }
      }

      const dias = Array.from(diasMap.entries())
        .sort((a,b)=> new Date(a[0]) - new Date(b[0]))
        .map(([fecha, actividades], idx) => ({
          id: idx + 1,
          titulo: `Día ${idx + 1}`,
          fecha,
          actividades: actividades
            .map((entry) => {
              if (entry.__kind === 'programa') {
                const p = entry.data;
                return {
                  sortKey: String(p.hora_inicio || ''),
                  node: {
                    id: `${idx + 1}-prog-${p.id}`,
                    hora: p.hora_inicio || '',
                    titulo: p.programa_info?.nombre || 'Actividad',
                    descripcion: p.programa_info?.descripcion || '',
                    tipo: (p.programa_info?.tipo || 'tour').toLowerCase(),
                    icono: iconForTipo(p.programa_info?.tipo),
                    color: p.programa_info?.tipo === 'comida' ? '#52c41a' : (p.programa_info?.tipo === 'hospedaje' ? '#722ed1' : '#1890ff'),
                    duracion: p.hora_inicio && p.hora_fin ? `${p.hora_inicio} - ${p.hora_fin}` : '',
                    lugar: '',
                    notas: null
                  }
                };
              }
              if (entry.__kind === 'transporte') {
                const t = entry.data;
                return {
                  sortKey: String(t.horario_recojo || ''),
                  node: {
                    id: `${idx + 1}-tr-${t.id_detalle_transporte}`,
                    hora: t.horario_recojo || '',
                    titulo: `Transporte (${t.transporte_info?.tipo || t.transporte_info?.empresa || 'Movilidad'})`,
                    descripcion: t.transporte_info?.empresa ? `Empresa: ${t.transporte_info.empresa}` : 'Transporte programado',
                    tipo: 'transporte',
                    icono: <CarOutlined />,
                    color: '#1890ff',
                    duracion: '',
                    lugar: t.lugar_recojo || '',
                    notas: t.transporte_info?.contacto ? `Contacto: ${t.transporte_info.contacto}` : null
                  }
                };
              }
              if (entry.__kind === 'machu') {
                const p = entry.data;
                const d = p.detalles_machupicchu || {};
                return {
                  sortKey: String(d.horario_tren_ida || p.hora_inicio || ''),
                  node: {
                    id: `${idx + 1}-mp-${p.id}`,
                    hora: d.horario_tren_ida || p.hora_inicio || '',
                    titulo: 'Visita Machu Picchu',
                    descripcion: d.ruta ? `Ruta: ${d.ruta}` : 'Detalle de visita',
                    tipo: 'actividad',
                    icono: <CarOutlined />,
                    color: '#faad14',
                    duracion: d.horario_tren_ida && d.horario_tren_retor ? `${d.horario_tren_ida} - ${d.horario_tren_retor}` : '',
                    lugar: '',
                    notas: `Guía: ${d.nombre_guia || '-'}`
                  }
                };
              }
              return { sortKey: '', node: null };
            })
            .filter(x => x && x.node)
            .sort((a,b)=> a.sortKey.localeCompare(b.sortKey))
            .map(x => x.node)
        }));

      return {
        id: it.id,
        titulo,
        fecha: fechaStr,
        destino: it?.grupo?.nombre_grupo || '',
        estado: it.estado_presupuesto || 'Próximo',
        colorEstado: estadoColor(it.estado_presupuesto),
        duracion: `${duracionDias}`,
        descripcion: it?.grupo?.descripcion || '',
        itinerario: dias
      };
    };

    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/turista/itinerarios', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setViajes(data.map(mapItinerario));
        }
      } catch (e) {
        console.error('Error cargando mis viajes:', e);
      }
    })();
  }, []);

  const mostrarDetallesActividad = (actividad) => {
    setActividadSeleccionada(actividad);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setActividadSeleccionada(null);
  };

  const renderActividad = (actividad) => (
    <div className="actividad-card">
      <div className="actividad-hora">
        <ClockCircleOutlined style={{ marginRight: 8, color: actividad.color }} />
        <Text strong>{actividad.hora}</Text>
      </div>
      <div className="actividad-contenido">
        <div className="actividad-icono" style={{ backgroundColor: `${actividad.color}20`, borderColor: actividad.color }}>
          {React.cloneElement(actividad.icono, { style: { color: actividad.color } })}
        </div>
        <div className="actividad-info">
          <div className="actividad-titulo">
            <Text strong>{actividad.titulo}</Text>
          </div>
          <Text type="secondary">{actividad.descripcion}</Text>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              mostrarDetallesActividad(actividad);
            }} 
            style={{ padding: 0, height: 'auto' }}
          >
            Ver detalles
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDia = (dia) => (
    <Card 
      key={dia.id} 
      title={dia.titulo} 
      className="dia-card"
      extra={
        <Text type="secondary" style={{ fontSize: '0.9em' }}>
          {dia.fecha}
        </Text>
      }
    >
      <div className="actividades-container">
        {dia.actividades.map(actividad => (
          <div key={actividad.id} className="actividad-wrapper">
            {renderActividad(actividad)}
          </div>
        ))}
      </div>
    </Card>
  );

  const renderViaje = (viaje) => (
    <Card 
      key={viaje.id} 
      className="viaje-card"
      title={
        <div className="viaje-header">
          <div>
            <Title level={4} style={{ margin: 0 }}>{viaje.titulo}</Title>
            <Text type="secondary" style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
              <CalendarOutlined />
              <span style={{ margin: '0 8px 0 4px' }}>{viaje.fecha}</span>
              <Tag color={viaje.colorEstado} style={{ marginLeft: 8 }}>
                {viaje.estado}
              </Tag>
            </Text>
          </div>
          <GenerarPDF viaje={viaje} />
        </div>
      }
    >
      <div className="viaje-descripcion">
        <Text>{viaje.descripcion}</Text>
      </div>
      <Divider orientation="left" style={{ margin: '24px 0 16px' }}>
        Itinerario del viaje
      </Divider>
      <div className="itinerario-container">
        {viaje.itinerario.map(dia => renderDia(dia))}
      </div>
    </Card>
  );

  const renderModalDetalles = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {actividadSeleccionada?.icono && React.cloneElement(actividadSeleccionada.icono, { 
            style: { 
              color: actividadSeleccionada.color,
              fontSize: '20px'
            } 
          })}
          <span>{actividadSeleccionada?.titulo || 'Detalles de la actividad'}</span>
        </div>
      }
      open={modalVisible}
      onCancel={cerrarModal}
      footer={[
        <Button 
          key="cerrar" 
          onClick={cerrarModal}
          type="primary"
          style={{
            backgroundColor: actividadSeleccionada?.color,
            borderColor: actividadSeleccionada?.color,
            padding: '0 24px',
            height: '40px',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          Cerrar
        </Button>
      ]}
      width={600}
      className="actividad-detalle-modal"
      styles={{
        body: { padding: '24px' }
      }}
    >
      {actividadSeleccionada && (
        <div className="detalles-actividad">
          <div className="detalle-item">
            <div className="detalle-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="detalle-contenido">
              <div className="detalle-etiqueta">Hora</div>
              <div className="detalle-valor">{actividadSeleccionada.hora} <span className="detalle-duracion">• {actividadSeleccionada.duracion}</span></div>
            </div>
          </div>
          
          <div className="detalle-item">
            <div className="detalle-icono">
              <EnvironmentOutlined style={{ fontSize: '18px' }} />
            </div>
            <div className="detalle-contenido">
              <div className="detalle-etiqueta">Lugar</div>
              <div className="detalle-valor">{actividadSeleccionada.lugar}</div>
            </div>
          </div>
          
          <div className="detalle-item">
            <div className="detalle-icono">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="detalle-contenido">
              <div className="detalle-etiqueta">Descripción</div>
              <div className="detalle-valor">{actividadSeleccionada.descripcion}</div>
            </div>
          </div>
          
          {actividadSeleccionada.notas && (
            <div className="detalle-item">
              <div className="detalle-icono">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="detalle-contenido">
                <div className="detalle-etiqueta">Notas adicionales</div>
                <div className="detalle-valor">{actividadSeleccionada.notas}</div>
              </div>
            </div>
          )}
          
          <div className="detalle-badge" style={{ backgroundColor: `${actividadSeleccionada.color}15`, borderColor: actividadSeleccionada.color }}>
            <span style={{ color: actividadSeleccionada.color }}>{actividadSeleccionada.tipo.charAt(0).toUpperCase() + actividadSeleccionada.tipo.slice(1)}</span>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="mis-viajes-page">
      <Title level={2} style={{ marginBottom: 24 }}>Mis Viajes</Title>
      
      {viajes.length > 0 ? (
        <div className="viajes-container">
          {viajes.map(viaje => renderViaje(viaje))}
        </div>
      ) : (
        <Empty
          description={
            <span>No tienes viajes programados</span>
          }
        >
          <Button type="primary">Explorar destinos</Button>
        </Empty>
      )}
      
      {renderModalDetalles()}
    </div>
  );
};

export default MisViajes;
