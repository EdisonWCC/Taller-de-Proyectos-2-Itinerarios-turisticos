import React from 'react'
import '../../format/admin.css'

export default function AdminNavbar({ admin }) {
  return (
    <header className="admin-navbar">
      <div className="admin-navbar__brand">Panel Administrador</div>
      <div className="admin-navbar__info">
        <span className="admin-navbar__name">{admin?.name || 'Administrador'}</span>
        <span className="admin-navbar__email">{admin?.email || 'admin@example.com'}</span>
      </div>
    </header>
  )
}
