import React from 'react'
import '../../format/admin.css'
import AdminNavbar from '../components/AdminNavbar'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminLayout({ admin, children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar admin={admin} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
