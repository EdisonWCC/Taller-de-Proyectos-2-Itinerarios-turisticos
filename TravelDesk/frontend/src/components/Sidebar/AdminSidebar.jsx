import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Button } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import "../../styles/Admin/AdminSidebar.css";

const { Sider } = Layout;

export const AdminSidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = location.pathname.split("/").pop() || "dashboard";
  const [itinerariosOpen, setItinerariosOpen] = useState(false);

  // Detectar si es tablet (768px - 1024px)
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width <= 1024);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);

    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  // Forzar sidebar colapsado por defecto en tablet
  useEffect(() => {
    if (isTablet) {
      onCollapse(true);
    }
  }, [isTablet]);


  const items = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin"),
    },
    {
      key: "roles",
      icon: <TeamOutlined />,
      label: "Roles",
      onClick: () => navigate("/admin/roles"),
    },
    {
      key: "registro",
      icon: <UserAddOutlined />,
      label: "Registro General",
      onClick: () => navigate("/admin/registro"),
    },
    {
      key: "listar-turistas",
      icon: <TeamOutlined />,
      label: "Listar Turistas",
      onClick: () => navigate("/admin/listar-turistas"),
    },
    {
      key: "itinerarios-submenu",
      icon: <CalendarOutlined />,
      label: "Itinerarios",
      children: [
        {
          key: "crear-itinerario",
          label: "Crear Nuevo",
          onClick: () => navigate("/admin/crear-itinerario"),
        },
        {
          key: "itinerarios",
          label: "Listar Itinerarios",
          onClick: () => navigate("/admin/itinerarios"),
        },
      ],
      onTitleClick: () => setItinerariosOpen(!itinerariosOpen),
    },
    {
      key: "cerrar-sesion",
      icon: <LogoutOutlined />,
      label: "Cerrar Sesión",
      onClick: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      },
    },
  ];

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={250}
      collapsedWidth={80}
      className="admin-sidebar"
      theme="light"
      trigger={null}
    >
      <div className="admin-sidebar-header">
        {!collapsed && <div className="admin-custom-sidebar-logo">AdminDesk</div>}

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          className="admin-sidebar-trigger"
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        openKeys={itinerariosOpen ? ["itinerarios-submenu"] : []}
        items={items}
      />
    </Sider>
  );
};

export default AdminSidebar;
