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

// Mapeo de notificaciones desde el backend a este componente
function mapBackendToUI(items = []) {
  return items.map((n, idx) => {
    const baseId = `${n.type}-${n.itinerario_id || 'it'}-${n.id_itinerario_programa || n.id_detalle_transporte || n.id_programa || n.referencia_id || idx}`;
    let ui = {
      id: baseId,
      title: '',
      message: '',
      type: 'info',
      read: Boolean(n.read),
      date: dayjs().toISOString(),
      // Passthrough para persistencia
      backend_type: n.type,
      itinerario_id: n.itinerario_id,
      id_itinerario_programa: n.id_itinerario_programa,
      id_detalle_transporte: n.id_detalle_transporte,
      id_programa: n.id_programa,
      referencia_id: n.referencia_id
    };
    if (n.type === 'programa_proximo') {
      ui.title = 'Programa próximo';
      const hora = n.hora_inicio ? ` a las ${n.hora_inicio}` : '';
      ui.message = `${n.title} el ${n.date}${hora}`;
      ui.type = 'info';
      // combinar fecha y hora si existe
      const dt = n.hora_inicio ? dayjs(`${n.date}T${n.hora_inicio}`) : dayjs(n.date);
      ui.date = dt.isValid() ? dt.toISOString() : dayjs().toISOString();
    } else if (n.type === 'transporte_recojo') {
      ui.title = 'Recojo de transporte';
      const hora = n.hora ? ` a las ${n.hora}` : '';
      const lugar = n.lugar ? ` — ${n.lugar}` : '';
      ui.message = `${n.title} el ${n.date}${hora}${lugar}`;
      ui.type = 'warning';
      const dt = n.hora ? dayjs(`${n.date}T${n.hora}`) : dayjs(n.date);
      ui.date = dt.isValid() ? dt.toISOString() : dayjs().toISOString();
    } else if (n.type === 'itinerario_actualizado') {
      ui.title = 'Actualización de itinerario';
      ui.message = `Se han realizado cambios en tu itinerario (ID ${n.itinerario_id}).`;
      ui.type = 'success';
      ui.date = n.updated_at ? dayjs(n.updated_at).toISOString() : dayjs().toISOString();
    } else if (n.type === 'programa_actualizado') {
      ui.title = 'Programa actualizado';
      const hora = n.hora_inicio ? ` (${n.hora_inicio}${n.hora_fin ? ` - ${n.hora_fin}` : ''})` : '';
      ui.message = `${n.title}${hora} — cambios recientes en el programa`;
      ui.type = 'warning';
      ui.date = n.updated_at ? dayjs(n.updated_at).toISOString() : dayjs().toISOString();
    } else if (n.type === 'transporte_actualizado') {
      ui.title = 'Transporte actualizado';
      const hora = n.hora ? ` a las ${n.hora}` : '';
      const lugar = n.lugar ? ` — ${n.lugar}` : '';
      ui.message = `${n.title}${hora}${lugar} — cambios recientes en el recojo`;
      ui.type = 'success';
      ui.date = n.updated_at ? dayjs(n.updated_at).toISOString() : dayjs().toISOString();
    } else if (n.type === 'machu_actualizado') {
      ui.title = 'Machu Picchu actualizado';
      const empresa = n.detalles_machu?.empresa_tren ? `Empresa: ${n.detalles_machu.empresa_tren}` : null;
      const guia = n.detalles_machu?.nombre_guia ? `Guía: ${n.detalles_machu.nombre_guia}` : null;
      const ruta = n.detalles_machu?.ruta ? `Ruta: ${n.detalles_machu.ruta}` : null;
      const ida = n.detalles_machu?.horario_tren_ida ? `Tren ida: ${n.detalles_machu.horario_tren_ida}` : null;
      const ret = n.detalles_machu?.horario_tren_retor ? `Tren retorno: ${n.detalles_machu.horario_tren_retor}` : null;
      const partes = [empresa, guia, ruta, ida, ret].filter(Boolean);
      ui.message = partes.length ? partes.join(' — ') : 'Cambios recientes en los detalles de Machu Picchu';
      ui.type = 'success';
      ui.date = n.updated_at ? dayjs(n.updated_at).toISOString() : dayjs().toISOString();
    } else if (n.type === 'cambio_detallado') {
      // Entrada proveniente de la tabla de auditoría 'itinerario_cambios'
      ui.title = n.title || 'Cambio en itinerario';
      ui.message = n.detalle || '';
      ui.type = 'success';
      ui.date = n.created_at ? dayjs(n.created_at).toISOString() : dayjs().toISOString();
    } else {
      // fallback
      ui.title = n.title || 'Notificación';
      ui.message = n.message || '';
      ui.type = 'info';
      ui.date = n.date ? dayjs(n.date).toISOString() : dayjs().toISOString();
    }
    return ui;
  });
}

const Notificaciones = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [token, setToken] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const stored = localStorage.getItem('user');
        const parsed = stored ? JSON.parse(stored) : null;
        const tk = parsed?.token || '';
        setToken(tk);
        const url = `http://localhost:3000/api/turista/notificaciones?dias=14`;
        const res = await fetch(url, {
          headers: {
            'Authorization': tk ? `Bearer ${tk}` : ''
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        const uiItems = mapBackendToUI(Array.isArray(data) ? data : []);
        if (!cancelled) setNotifications(uiItems);
      } catch (err) {
        // Si hay error de auth u otro, mostrar vacío
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = async (notif) => {
    // Optimista
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    try {
      if (!token) return;
      await fetch('http://localhost:3000/api/turista/notificaciones/leida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tipo: notif.backend_type,
          itinerario_id: notif.itinerario_id,
          referencia_id: (notif.referencia_id ?? (notif.id_itinerario_programa || notif.id_detalle_transporte || notif.id_programa || null))
        })
      });
    } catch {}
  };

  const markAllAsRead = async () => {
    // Optimista en UI
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    try {
      if (!token) return;
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => fetch('http://localhost:3000/api/turista/notificaciones/leida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tipo: n.backend_type,
          itinerario_id: n.itinerario_id,
          referencia_id: (n.referencia_id ?? (n.id_itinerario_programa || n.id_detalle_transporte || n.id_programa || null))
        })
      })));
      // Refrescar desde backend para asegurar que 'read' persista tras reload
      const url = `http://localhost:3000/api/turista/notificaciones?dias=14`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setNotifications(mapBackendToUI(data));
      }
    } catch {}
  };

  const deleteNotification = async (notif) => {
    // Optimista
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    try {
      if (!token) return;
      await fetch('http://localhost:3000/api/turista/notificaciones/descartar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tipo: notif.backend_type,
          itinerario_id: notif.itinerario_id,
          referencia_id: (notif.referencia_id ?? (notif.id_itinerario_programa || notif.id_detalle_transporte || notif.id_programa || null))
        })
      });
    } catch {}
  };

  const clearAllNotifications = async () => {
    // Optimista: limpiar UI
    const toDelete = notifications.slice();
    setNotifications([]);
    try {
      if (!token || toDelete.length === 0) return;
      await Promise.all(toDelete.map(n => fetch('http://localhost:3000/api/turista/notificaciones/descartar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tipo: n.backend_type,
          itinerario_id: n.itinerario_id,
          referencia_id: (n.referencia_id ?? (n.id_itinerario_programa || n.id_detalle_transporte || n.id_programa || null))
        })
      })));
      // Refrescar desde backend para asegurar consistencia
      const url = `http://localhost:3000/api/turista/notificaciones?dias=14`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setNotifications(mapBackendToUI(data));
      }
    } catch {}
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
                onClick={() => markAsRead(notification)}
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
                      deleteNotification(notification);
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
