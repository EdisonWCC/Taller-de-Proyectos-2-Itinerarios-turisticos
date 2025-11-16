import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Drawer, Button } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import '../../styles/Admin/AdminSidebar.css';

const { Sider } = Layout;

export const AdminSidebar = ({ collapsed, onCollapse, isMobile, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey = location.pathname.split('/').pop() || 'dashboard';
  const [itinerariosOpen, setItinerariosOpen] = useState(false);

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin')
    },
    {
      key: 'roles',
      icon: <TeamOutlined />,
      label: 'Roles',
      onClick: () => navigate('/admin/roles')
    },
    {
      key: 'registro',
      icon: <UserAddOutlined />,
      label: 'Registro General',
      onClick: () => navigate('/admin/registro')
    },
    {
      key: 'listar-turistas',
      icon: <TeamOutlined />,
      label: 'Listar Turistas',
      onClick: () => navigate('/admin/listar-turistas')
    },
    {
      key: 'itinerarios-submenu',
      icon: <CalendarOutlined />,
      label: 'Itinerarios',
      children: [
        {
          key: 'crear-itinerario',
          label: 'Crear Nuevo',
          onClick: () => navigate('/admin/crear-itinerario')
        },
        {
          key: 'itinerarios',
          label: 'Listar Itinerarios',
          onClick: () => navigate('/admin/itinerarios')
        }
      ],
      onTitleClick: () => setItinerariosOpen(!itinerariosOpen)
    },
    {
      key: 'ajustes',
      icon: <SettingOutlined />,
      label: 'Ajustes',
      onClick: () => navigate('/admin/ajustes')
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
      openKeys={itinerariosOpen ? ['itinerarios-submenu'] : []}
      items={items}
      className="admin-sidebar-menu"
    />
  );

  if (isMobile) {
    return (
      <>
        <Button
          type="primary"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onClose}
          className="admin-mobile-sidebar-trigger"
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
          className="admin-mobile-sidebar-drawer"
          closeIcon={<CloseOutlined style={{ color: '#fff' }} />}
          styles={{
            body: { padding: 0 }
          }}
        >
          <div className="admin-mobile-sidebar">
            <div className="admin-sidebar-header">
              <div className="admin-logo-container">
                <div className="admin-logo-icon">AD</div>
                <div className="admin-custom-sidebar-logo">AdminDesk</div>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                className="admin-sidebar-trigger"
                style={{ color: '#722ed1' }}
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
      className="admin-sidebar"
      theme="light"
      trigger={null}
    >
      <div className="admin-sidebar-header">
        {!collapsed && (
          <div className="admin-logo-container" style={{ flex: 1 }}>
            <div className="admin-logo-icon">AD</div>
            <div className="admin-custom-sidebar-logo">AdminDesk</div>
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onClose}
          className="admin-sidebar-trigger"
          style={{ 
            color: '#722ed1',
            marginLeft: collapsed ? 0 : 'auto'
          }}
        />
      </div>
      
      <Menu 
        theme="light" 
        mode="inline" 
        selectedKeys={[selectedKey]}
        openKeys={itinerariosOpen ? ['itinerarios-submenu'] : []}
        items={items}
      />
    </Sider>
  );
};

export default AdminSidebar;
