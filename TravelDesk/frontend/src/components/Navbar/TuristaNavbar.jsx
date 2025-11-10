import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge } from 'antd';

import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/Turista/Navbar.css';
import useUnreadNotificationsCount from '../../hooks/useUnreadNotificationsCount';

const { Header } = Layout;

export const TuristaNavbar = () => {
  const navigate = useNavigate();
  const { count } = useUnreadNotificationsCount();

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => navigate('/turista/perfil')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/turista/ajustes')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    }
  ];

  return (
    <Header className="navbar">
      <div className="navbar-left">
        <div className="logo-mobile">TravelDesk</div>
      </div>
      
      <div className="navbar-right">
        <Badge count={count} className="notification-badge">
          <Button type="text" icon={<BellOutlined />} className="notification-btn" onClick={() => navigate('/turista/notificaciones')} />
        </Badge>
        
        <Dropdown menu={{ items }} trigger={['click']}>
          <div className="user-menu">
            <Avatar 
              size="default" 
              icon={<UserOutlined />} 
              className="user-avatar"
            />
            <span className="user-name">Usuario Turista</span>
            <DownOutlined />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TuristaNavbar;