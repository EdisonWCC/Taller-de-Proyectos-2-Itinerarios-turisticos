import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Drawer, Button } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import '../../styles/Turista/Sidebar.css';

const { Sider } = Layout;

export const TuristaSidebar = ({ collapsed, onCollapse, isMobile, onClose }) => {
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

  const menuContent = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      className="sidebar-menu"
    />
  );

  if (isMobile) {
    return (
      <>
        <Button
          type="primary"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onClose}
          className="mobile-sidebar-trigger"
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        />
        <Drawer
          placement="left"
          width={250}
          onClose={onClose}
          open={!collapsed}
          className="mobile-sidebar-drawer"
          closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
          styles={{
            body: { padding: 0 }
          }}
        >
          <div className="mobile-sidebar">
            <div className="sidebar-header">
              <div className="logo-container">
                <div className="logo-icon">TD</div>
                <div className="custom-sidebar-logo">TravelDesk</div>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                className="sidebar-trigger"
                style={{ color: '#420000ff' }}
              />
            </div>
            {menuContent}
          </div>
        </Drawer>
      </>
    );
  }

  return (
    <Sider 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      width={250}
      className="sidebar"
      theme="light"
      trigger={null}
    >
      <div className="sidebar-header">
        {!collapsed && (
          <div className="logo-container" style={{ flex: 1 }}>
            <div className="logo-icon">TD</div>
            <div className="custom-sidebar-logo">TravelDesk</div>
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onClose}
          className="sidebar-trigger"
          style={{ 
            color: '#420000ff',
            marginLeft: collapsed ? 0 : 'auto'
          }}
        />
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
