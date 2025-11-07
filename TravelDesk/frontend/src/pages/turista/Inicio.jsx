import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { CalendarOutlined, StarOutlined, CompassOutlined } from '@ant-design/icons';
import '../../styles/Turista/turista.css';

const { Title, Text } = Typography;

const Inicio = () => {
  return (
    <div className="turista-page">
      <Title level={2} className="page-title">Bienvenido de vuelta</Title>
      
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#e6f7ff' }}>
                <CalendarOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
              </div>
              <div className="stat-info">
                <Text type="secondary">Próximo viaje</Text>
                <Title level={4} style={{ margin: '4px 0 0 0' }}>Cusco Mágico</Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#f6ffed' }}>
                <CompassOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
              </div>
              <div className="stat-info">
                <Text type="secondary">En progreso</Text>
                <Title level={4} style={{ margin: '4px 0 0 0' }}>3 Actividades</Title>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon" style={{ backgroundColor: '#fff7e6' }}>
                <StarOutlined style={{ color: '#faad14', fontSize: '24px' }} />
              </div>
              <div className="stat-info">
                <Text type="secondary">Favoritos</Text>
                <Title level={4} style={{ margin: '4px 0 0 0' }}>5 Lugares</Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Card className="recent-activities" style={{ marginTop: '24px' }}>
        <Title level={4} style={{ marginBottom: '16px' }}>Actividades recientes</Title>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <CalendarOutlined />
            </div>
            <div className="activity-details">
              <Text strong>Tour por el Valle Sagrado</Text>
              <Text type="secondary">Agregado el 5 de noviembre</Text>
            </div>
            <Text type="secondary">10:00 AM</Text>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">
              <CalendarOutlined />
            </div>
            <div className="activity-details">
              <Text strong>Visita a Machu Picchu</Text>
              <Text type="secondary">Agendado para el 15 de noviembre</Text>
            </div>
            <Text type="secondary">Todo el día</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Inicio;
