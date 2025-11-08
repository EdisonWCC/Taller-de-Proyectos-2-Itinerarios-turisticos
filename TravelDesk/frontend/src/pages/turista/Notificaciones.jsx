import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Typography, Button, Badge, Empty, Divider, Dropdown, Menu } from 'antd';
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  DownOutlined,
  DeleteOutlined,
  CheckOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import relativeTime from 'dayjs/plugin/relativeTime';
import './Notificaciones.css';

// Configuración de dayjs
dayjs.extend(relativeTime);
dayjs.locale('es');

const { Title, Text } = Typography;

// Datos de ejemplo para las notificaciones
const mockNotifications = [
  {
    id: 1,
    title: '¡Tu itinerario está listo!',
    message: 'Hemos preparado tu itinerario para el viaje a París. ¡Revisa los detalles!',
    type: 'info',
    read: false,
    date: dayjs().subtract(5, 'minute').toISOString(),
    action: {
      text: 'Ver itinerario',
      path: '/mis-viajes/123'
    }
  },
  {
    id: 2,
    title: 'Recordatorio de pago',
    message: 'Tu reserva en el Hotel Eiffel Tower View está pendiente de pago. Vence en 2 días.',
    type: 'warning',
    read: false,
    date: dayjs().subtract(2, 'hour').toISOString(),
    action: {
      text: 'Pagar ahora',
      path: '/pagos/pendientes/456'
    }
  },
  {
    id: 3,
    title: '¡Oferta especial!',
    message: 'Descuento del 20% en excursiones por tiempo limitado. ¡No te lo pierdas!',
    type: 'promo',
    read: true,
    date: dayjs().subtract(1, 'day').toISOString(),
    action: {
      text: 'Ver ofertas',
      path: '/ofertas/verano-2023'
    }
  },
  {
    id: 4,
    title: 'Confirmación de reserva',
    message: 'Tu vuelo de ida y vuelta a París ha sido confirmado. Número de reserva: AB123456',
    type: 'success',
    read: true,
    date: dayjs().subtract(3, 'day').toISOString()
  }
];

const Notificaciones = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({
      ...notif,
      read: true
    })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined className="notification-icon success" />;
      case 'warning':
        return <ExclamationCircleOutlined className="notification-icon warning" />;
      case 'promo':
        return <Tag color="gold" className="notification-tag">Oferta</Tag>;
      default:
        return <BellOutlined className="notification-icon info" />;
    }
  };

  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: 'Marcar todas como leídas',
          icon: <CheckOutlined />,
          onClick: markAllAsRead,
          disabled: !notifications.some(n => !n.read)
        },
        {
          key: '2',
          label: 'Eliminar todas',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: clearAllNotifications,
          disabled: notifications.length === 0
        },
      ]}
    />
  );

  return (
    <div className="notificaciones-page">
      <div className="notificaciones-header">
        <Title level={2} className="page-title">
          <BellOutlined style={{ marginRight: 12 }} />
          Notificaciones
          {notifications.some(n => !n.read) && (
            <Badge 
              count={notifications.filter(n => !n.read).length} 
              style={{ 
                backgroundColor: '#1890ff',
                marginLeft: 12,
                fontSize: '0.75rem',
                height: '20px',
                lineHeight: '20px',
                minWidth: '20px',
                borderRadius: '10px'
              }} 
            />
          )}
        </Title>
        
        <div className="notificaciones-actions">
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} className="more-actions" />
          </Dropdown>
          
          <Button 
            type="primary" 
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
            className="action-button"
          >
            Marcar todo como leído
          </Button>
        </div>
      </div>

      <Card className="notificaciones-container">
        <div className="filtros-notificaciones">
          <Button 
            type={filter === 'all' ? 'primary' : 'text'} 
            onClick={() => setFilter('all')}
            className="filtro-button"
          >
            Todas
          </Button>
          <Button 
            type={filter === 'unread' ? 'primary' : 'text'} 
            onClick={() => setFilter('unread')}
            className="filtro-button"
          >
            No leídas
          </Button>
          <Button 
            type={filter === 'warning' ? 'primary' : 'text'} 
            onClick={() => setFilter('warning')}
            className="filtro-button"
          >
            Importantes
          </Button>
          <Button 
            type={filter === 'promo' ? 'primary' : 'text'} 
            onClick={() => setFilter('promo')}
            className="filtro-button"
          >
            Ofertas
          </Button>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {loading ? (
          <div className="loading-notifications">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-notification" />
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(notification) => (
              <List.Item 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-content">
                  <div className="notification-icon-container">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-details">
                    <div className="notification-header">
                      <Text strong className="notification-title">
                        {notification.title}
                      </Text>
                      <Text type="secondary" className="notification-time">
                        {dayjs(notification.date).fromNow()}
                      </Text>
                    </div>
                    <Text className="notification-message">
                      {notification.message}
                    </Text>
                    {notification.action && (
                      <Button 
                        type="link" 
                        className="notification-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navegar a la acción correspondiente
                          console.log('Navegar a:', notification.action.path);
                        }}
                      >
                        {notification.action.text}
                      </Button>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="notification-badge" />
                  )}
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    className="delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  />
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>No hay notificaciones para mostrar</span>
            }
            className="empty-notifications"
          >
            <Button type="primary" onClick={() => setFilter('all')}>
              Ver todas las notificaciones
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default Notificaciones;
