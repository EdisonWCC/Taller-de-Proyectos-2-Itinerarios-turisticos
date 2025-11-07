import React from 'react';
import { Card, Tag, Typography, Empty, Timeline, Row, Col, Divider, Button } from 'antd';
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

const MisViajes = () => {
  // Datos de ejemplo - en una aplicación real, esto vendría de una API
  const viajes = [
    {
      id: 1,
      titulo: 'Aventura en Cusco',
      fecha: '15 - 20 Nov 2023',
      destino: 'Cusco, Perú',
      estado: 'Próximo',
      colorEstado: 'blue',
      duracion: '5 días / 4 noches',
      descripcion: 'Un viaje inolvidable por la capital del Imperio Inca, explorando sus majestuosos paisajes y rica cultura.',
      itinerario: generarItinerario(5)
    },
    {
      id: 2,
      titulo: 'Descanso en Paracas',
      fecha: '5 - 10 Dic 2023',
      destino: 'Paracas, Perú',
      estado: 'Confirmado',
      colorEstado: 'green',
      duracion: '3 días / 2 noches',
      descripcion: 'Disfruta de las hermosas playas y la rica biodiversidad de la Reserva Nacional de Paracas.',
      itinerario: generarItinerario(3)
    },
    {
      id: 3,
      titulo: 'Cultura en Lima',
      fecha: '20 - 25 Ene 2024',
      destino: 'Lima, Perú',
      estado: 'Pendiente',
      colorEstado: 'orange',
      duracion: '4 días / 3 noches',
      descripcion: 'Descubre la riqueza cultural y gastronómica de la Ciudad de los Reyes.',
      itinerario: generarItinerario(4)
    }
  ];

  const renderActividad = (actividad) => (
    <div key={actividad.id} className="actividad-card">
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
        </div>
      </div>
    </div>
  );

  const renderDiaItinerario = (dia) => (
    <div key={dia.id} className="dia-itinerario">
      <div className="dia-header">
        <div>
          <Title level={4} style={{ margin: 0 }}>{dia.titulo}</Title>
          <Text type="secondary">{dia.fecha}</Text>
        </div>
        <Tag color="blue">{dia.actividades.length} actividades</Tag>
      </div>
      <div className="actividades-dia">
        {dia.actividades.map(actividad => renderActividad(actividad))}
      </div>
    </div>
  );

  return (
    <div className="mis-viajes-page">
      <div className="page-header">
        <Title level={2}>Mis Itinerarios</Title>
        <Text type="secondary">Revisa y gestiona tus viajes programados</Text>
      </div>
      
      {viajes.length > 0 ? (
        <div className="viajes-lista">
          {viajes.map(viaje => (
            <Card 
              key={viaje.id} 
              className="viaje-card"
              title={
                <div className="viaje-card-header">
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{viaje.titulo}</Title>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={viaje.colorEstado} style={{ marginRight: 8 }}>
                        {viaje.estado}
                      </Tag>
                      <Text type="secondary">
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {viaje.fecha} • {viaje.duracion}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                        {viaje.destino}
                      </Text>
                    </div>
                  </div>
                </div>
              }
              extra={[
                <Button key="ver" type="text" icon={<EyeOutlined />}>Ver detalles</Button>,
                <Button key="descargar" type="text" icon={<DownloadOutlined />}>Itinerario</Button>
              ]}
            >
              <div className="viaje-descripcion">
                <Text>{viaje.descripcion}</Text>
              </div>
              
              <Divider orientation="left" style={{ margin: '24px 0 16px' }}>
                Itinerario del viaje
              </Divider>
              
              <div className="itinerario-container">
                {viaje.itinerario.map(dia => renderDiaItinerario(dia))}
              </div>
              
              <div className="viaje-acciones" style={{ marginTop: 24, textAlign: 'right' }}>
                <Button type="primary" style={{ marginRight: 8 }}>Ver itinerario completo</Button>
                <Button>Compartir</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty 
          description={
            <span>No tienes viajes programados</span>
          }
          style={{ margin: '40px 0' }}
        >
          <Button type="primary">Planificar nuevo viaje</Button>
        </Empty>
      )}
    </div>
  );
};

export default MisViajes;
