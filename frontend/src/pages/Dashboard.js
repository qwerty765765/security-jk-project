import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ passes: 0, incidents: 0 });

  useEffect(() => {
    fetchUserInfo();
    fetchStats();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to fetch user info', err);
    }
  };

  const fetchStats = async () => {
    try {
      const passesRes = await api.get('/passes/');
      const incidentsRes = await api.get('/incidents/');
      setStats({
        passes: passesRes.data.length,
        incidents: incidentsRes.data.length
      });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <div className="card">
          <h3>Welcome, {user.full_name}!</h3>
          <p>Email: {user.email}</p>
          <p>Apartment: {user.apartment_number || 'Not specified'}</p>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Access Passes</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.passes}</p>
          <p>Total passes requested</p>
        </div>
        <div className="card">
          <h3>Security Incidents</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.incidents}</p>
          <p>Total incidents reported</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
