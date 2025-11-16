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
import '../../styles/Admin/AdminNavbar.css';

const { Header } = Layout;

const AdminNavbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => navigate('/admin/perfil')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/admin/ajustes')
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
    <Header className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-logo-mobile">AdminDesk</div>
      </div>
      
      <div className="admin-navbar-right">
        <Badge count={0} className="admin-notification-badge">
          <Button type="text" icon={<BellOutlined />} className="admin-notification-btn" onClick={() => navigate('/admin/notificaciones')} />
        </Badge>
        
        <Dropdown menu={{ items }} trigger={['click']}>
          <div className="admin-user-menu">
            <Avatar 
              size="default" 
              icon={<UserOutlined />} 
              className="admin-user-avatar"
            />
            <span className="admin-user-name">{user?.name || 'Administrador'}</span>
            <DownOutlined />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AdminNavbar;