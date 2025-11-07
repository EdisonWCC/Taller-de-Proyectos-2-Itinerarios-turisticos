import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { TuristaNavbar } from '../../components/Navbar/TuristaNavbar';
import { TuristaSidebar } from '../../components/Sidebar/TuristaSidebar';
import '../../styles/Turista/MainLayout.css';

const { Header, Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="main-layout">
      <TuristaSidebar 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
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
