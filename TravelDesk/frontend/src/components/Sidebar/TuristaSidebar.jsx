import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import '../../styles/Turista/Sidebar.css';

const { Sider } = Layout;

export const TuristaSidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = location.pathname.split('/').pop() || 'inicio';

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
