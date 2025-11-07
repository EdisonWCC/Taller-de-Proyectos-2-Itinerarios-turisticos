import React from 'react';
import { Card, List, Tag, Typography, Empty } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import '../../styles/Turista/turista.css';

const { Title, Text } = Typography;

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
      actividades: [
        'Tour por el Valle Sagrado',
        'Visita a Machu Picchu',
        'Cena en Aguas Calientes'
      ]
    },
    {
      id: 2,
      titulo: 'Descanso en Paracas',
      fecha: '5 - 10 Dic 2023',
      destino: 'Paracas, Perú',
      estado: 'Confirmado',
      colorEstado: 'green',
      actividades: [
        'Tour a las Islas Ballestas',
        'Paseo en buggies por el desierto',
        'Almuerzo en la playa'
      ]
    },
    {
      id: 3,
      titulo: 'Cultura en Lima',
      fecha: '20 - 25 Ene 2024',
      destino: 'Lima, Perú',
      estado: 'Pendiente',
      colorEstado: 'orange',
      actividades: [
        'Tour gastronómico por Barranco',
        'Visita al Museo Larco',
        'Paseo por el centro histórico'
      ]
    }
  ];

  return (
    <div className="turista-page">
      <Title level={2}>Mis Viajes</Title>
      
      {viajes.length > 0 ? (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={viajes}
          renderItem={viaje => (
            <List.Item key={viaje.id}>
              <Card className="viaje-card">
                <div className="viaje-header">
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{viaje.titulo}</Title>
                    <div style={{ marginTop: '8px' }}>
                      <Tag color={viaje.colorEstado} style={{ marginRight: '8px' }}>
                        {viaje.estado}
                      </Tag>
                      <Text type="secondary">
                        <CalendarOutlined style={{ marginRight: '4px' }} />
                        {viaje.fecha}
                      </Text>
                      <Text type="secondary" style={{ marginLeft: '16px' }}>
                        <EnvironmentOutlined style={{ marginRight: '4px' }} />
                        {viaje.destino}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">
                      <ClockCircleOutlined style={{ marginRight: '4px' }} />
                      {viaje.actividades.length} actividades
                    </Text>
                  </div>
                </div>
                
                <div className="actividades-list">
                  {viaje.actividades.map((actividad, index) => (
                    <div key={index} className="actividad-item">
                      <div className="actividad-bullet"></div>
                      <Text>{actividad}</Text>
                    </div>
                  ))}
                </div>
                
                <div className="viaje-actions" style={{ marginTop: '16px', textAlign: 'right' }}>
                  <a style={{ marginRight: '16px' }}>Ver detalles</a>
                  <a>Descargar itinerario</a>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty 
          description={
            <span>No tienes viajes programados</span>
          }
          style={{ marginTop: '48px' }}
        >
          <a>Explorar destinos</a>
        </Empty>
      )}
    </div>
  );
};

export default MisViajes;
