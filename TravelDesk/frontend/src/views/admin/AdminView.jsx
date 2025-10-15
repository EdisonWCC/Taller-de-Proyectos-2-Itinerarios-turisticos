import React from 'react'
import AdminLayout from './design/layouts/AdminLayout'
import useAdminInfo from './logic/useAdminInfo'
import './format/admin.css'
import TuristForm from './design/components/FormularioTurista'

export default function AdminView() {
  const { admin } = useAdminInfo()

  return (
    <AdminLayout admin={admin}>
      <section id="turistas" style={{ marginBottom: 16 }}>
        <TuristForm />
      </section>
      <section id="resumen" className="admin-card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Resumen</h2>
        <p>Bienvenido, {admin.name}. Aquí verás una vista general del sistema.</p>
      </section>

      <section id="perfil" className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Información del Administrador</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li><strong>Nombre:</strong> {admin.name}</li>
          <li><strong>Correo:</strong> {admin.email}</li>
          <li><strong>Rol:</strong> {admin.role}</li>
          <li><strong>Último ingreso:</strong> {admin.lastLogin}</li>
        </ul>
      </section>

      <section id="siguiente" className="admin-card">
        <h3 style={{ marginTop: 0 }}>Siguientes pasos</h3>
        <p>Integra datos reales desde tu backend y completa los módulos del sidebar.</p>
      </section>
    </AdminLayout>
  )
}
