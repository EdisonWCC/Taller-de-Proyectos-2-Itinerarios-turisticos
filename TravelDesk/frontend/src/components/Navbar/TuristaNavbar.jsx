import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../styles/Turista/Navbar.css';

const { Header } = Layout;

export const TuristaNavbar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();

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
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleSidebar}
          className="sidebar-trigger"
        />
        <div className="logo-mobile">TravelDesk</div>
      </div>
      
      <div className="navbar-right">
        <Badge count={5} className="notification-badge">
          <Button type="text" icon={<BellOutlined />} className="notification-btn" />
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