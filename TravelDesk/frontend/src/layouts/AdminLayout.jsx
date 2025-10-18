import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Sidebar/AdminSidebar.jsx";
import "../styles/Admin/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar-container">
        <AdminSidebar />
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
