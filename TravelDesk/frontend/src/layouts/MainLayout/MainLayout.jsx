import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { TuristaNavbar } from '../../components/Navbar/TuristaNavbar';
import { TuristaSidebar } from '../../components/Sidebar/TuristaSidebar';
import '../../styles/Turista/MainLayout.css';

const { Header, Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Si cambia a móvil y el sidebar está abierto, ciérralo
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="main-layout">
      <TuristaSidebar 
        collapsed={collapsed} 
        onClose={toggleSidebar}
        onCollapse={setCollapsed}
        isMobile={isMobile}
      />
      <Layout className="site-layout">
        <Header className="site-layout-header">
          <TuristaNavbar collapsed={collapsed} toggleSidebar={toggleSidebar} />
        </Header>
        <Content className="site-layout-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
