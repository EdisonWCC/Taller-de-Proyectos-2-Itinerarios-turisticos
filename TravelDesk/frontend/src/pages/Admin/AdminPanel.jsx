import React from "react";
import "../../styles/Admin/AdminPanel.css";

function AdminPanel() {
  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <h1>Panel de Administración</h1>
        <p>Resumen general del sistema TravelDesk</p>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-icon">👥</div>
          <div className="card-title">Usuarios</div>
          <div className="card-value">120</div>
        </div>

        <div className="card">
          <div className="card-icon">🧭</div>
          <div className="card-title">Itinerarios</div>
          <div className="card-value">45</div>
        </div>

        <div className="card">
          <div className="card-icon">💬</div>
          <div className="card-title">Reservas</div>
          <div className="card-value">78</div>
        </div>

        <div className="card">
          <div className="card-icon">⚠️</div>
          <div className="card-title">Reportes</div>
          <div className="card-value">2</div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
