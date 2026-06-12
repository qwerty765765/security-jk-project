import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/passes">Access Passes</Link>
          <Link to="/incidents">Security Incidents</Link>
        </div>
        <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', padding: '5px 15px' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
