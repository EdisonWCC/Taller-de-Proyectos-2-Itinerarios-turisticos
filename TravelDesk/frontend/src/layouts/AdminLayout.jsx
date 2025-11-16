import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { AdminSidebar } from '../components/Sidebar/AdminSidebar';
import AdminNavbar from '../components/Navbar/AdminNavbar';
import '../styles/Admin/AdminLayout.css';

const { Content } = Layout;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="admin-layout">
      <AdminSidebar 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        isMobile={isMobile}
        onClose={toggleSidebar}
      />
      <Layout className="admin-site-layout">
        <AdminNavbar />
        <Content className="admin-content">
          <div className="admin-content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
