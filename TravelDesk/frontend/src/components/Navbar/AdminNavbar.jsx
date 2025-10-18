import React from 'react';
import '../../styles/Admin/AdminNavbar.css';

const AdmiNavber = () => {
  return (
    <nav className="admin-navbar">
      <a href="#" className="admin-navbar-link active">Dashboard</a>
      <a href="#" className="admin-navbar-link">Users</a>
      <a href="#" className="admin-navbar-link">Settings</a>
    </nav>
  );
};

export default AdmiNavber;