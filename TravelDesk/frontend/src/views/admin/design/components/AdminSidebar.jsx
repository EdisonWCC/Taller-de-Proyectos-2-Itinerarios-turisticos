import React from 'react'
import '../../format/admin.css'

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__title">Navegación</div>
      <nav className="admin-sidebar__nav">
        <a className="admin-sidebar__link" href="#turistas">Turistas</a>
        <a className="admin-sidebar__link" href="#resumen">Resumen</a>
        <a className="admin-sidebar__link" href="#usuarios">Usuarios</a>
        <a className="admin-sidebar__link" href="#reportes">Reportes</a>
        <a className="admin-sidebar__link" href="#ajustes">Ajustes</a>
      </nav>
    </aside>
  )
}
