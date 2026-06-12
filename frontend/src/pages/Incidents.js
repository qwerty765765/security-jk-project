import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium',
    location: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const fetchIncidents = useCallback(async () => {
    try {
      const params = filterSeverity ? { severity: filterSeverity } : {};
      const response = await api.get('/incidents/', { params });
      setIncidents(response.data);
    } catch (err) {
      setError('Failed to load incidents');
    }
  }, [filterSeverity]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/incidents/', newIncident);
      setNewIncident({ title: '', description: '', severity: 'medium', location: '' });
      setShowForm(false);
      fetchIncidents();
    } catch (err) {
      setError('Failed to create incident');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <div>
      <h1>Security Incidents</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Report Incident'}
        </button>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {showForm && (
        <div className="card">
          <h3>Report New Incident</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={newIncident.title}
                onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={newIncident.description}
                onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={newIncident.location}
                onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Severity:</label>
              <select
                value={newIncident.severity}
                onChange={(e) => setNewIncident({...newIncident, severity: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit">Submit Report</button>
          </form>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {incidents.map(incident => (
        <div key={incident.id} className="card">
          <div style={{ borderLeft: `4px solid ${getSeverityColor(incident.severity)}`, paddingLeft: '15px' }}>
            <h3>{incident.title}</h3>
            <p>{incident.description}</p>
            {incident.location && <p><strong>Location:</strong> {incident.location}</p>}
            <p><strong>Severity:</strong> <span style={{ color: getSeverityColor(incident.severity) }}>{incident.severity}</span></p>
            <p><strong>Reported:</strong> {new Date(incident.created_at).toLocaleString()}</p>
          </div>
        </div>
      ))}
      {incidents.length === 0 && <p>No incidents reported.</p>}
    </div>
  );
}

export default Incidents;
