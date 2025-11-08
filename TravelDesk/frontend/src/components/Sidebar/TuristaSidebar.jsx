import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import '../../styles/Turista/Sidebar.css';

const { Sider } = Layout;

export const TuristaSidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = location.pathname.split('/').pop() || 'inicio';

  // Simulando notificaciones no leídas (esto debería venir de tu estado global o contexto)
  const unreadCount = 3; // Esto debería venir de tu estado de notificaciones

  const items = [
    {
      key: 'inicio',
      icon: <HomeOutlined />,
      label: 'Inicio',
      onClick: () => navigate('/turista/inicio')
    },
    {
      key: 'mis-viajes',
      icon: <CalendarOutlined />,
      label: 'Mis Viajes',
      onClick: () => navigate('/turista/mis-viajes')
    },
    {
      key: 'notificaciones',
      icon: (
        <div style={{ position: 'relative' }}>
          <BellOutlined />
          {unreadCount > 0 && (
            <span 
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#ff4d4f',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Notificaciones',
      onClick: () => navigate('/turista/notificaciones')
    },
    {
      key: 'perfil',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/turista/perfil')
    },
    {
      key: 'ajustes',
      icon: <SettingOutlined />,
      label: 'Ajustes',
      onClick: () => navigate('/turista/ajustes')
    },
    {
      key: 'cerrar-sesion',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      },
    },
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      width={250}
      className="sidebar"
      theme="light"
    >
      <div className="logo">
        {!collapsed ? 'TravelDesk' : 'TD'}
      </div>
      
      <Menu 
        theme="light" 
        mode="inline" 
        selectedKeys={[selectedKey]}
        items={items}
      />
    </Sider>
  );
};

export default TuristaSidebar;
