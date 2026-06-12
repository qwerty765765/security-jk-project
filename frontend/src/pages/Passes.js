import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Passes() {
  const [passes, setPasses] = useState([]);
  const [newPass, setNewPass] = useState({
    visitor_name: '',
    purpose: '',
    date_from: '',
    date_to: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const response = await api.get('/passes/');
      setPasses(response.data);
    } catch (err) {
      setError('Failed to load passes');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/passes/', newPass);
      setNewPass({ visitor_name: '', purpose: '', date_from: '', date_to: '' });
      setShowForm(false);
      fetchPasses();
    } catch (err) {
      setError('Failed to create pass');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/passes/${id}`);
        fetchPasses();
      } catch (err) {
        setError('Failed to delete pass');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'orange';
    }
  };

  return (
    <div>
      <h1>Access Passes</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Request New Pass'}
      </button>

      {showForm && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>New Access Pass Request</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Visitor Name:</label>
              <input
                type="text"
                value={newPass.visitor_name}
                onChange={(e) => setNewPass({...newPass, visitor_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Purpose:</label>
              <textarea
                value={newPass.purpose}
                onChange={(e) => setNewPass({...newPass, purpose: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Date From:</label>
              <input
                type="date"
                value={newPass.date_from}
                onChange={(e) => setNewPass({...newPass, date_from: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Date To:</label>
              <input
                type="date"
                value={newPass.date_to}
                onChange={(e) => setNewPass({...newPass, date_to: e.target.value})}
                required
              />
            </div>
            <button type="submit">Submit Request</button>
          </form>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <div style={{ marginTop: '20px' }}>
        {passes.map(pass => (
          <div key={pass.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{pass.visitor_name}</h3>
                <p>Purpose: {pass.purpose || 'Not specified'}</p>
                <p>Period: {pass.date_from} to {pass.date_to}</p>
                <p>Status: <span style={{ color: getStatusColor(pass.status), fontWeight: 'bold' }}>{pass.status}</span></p>
                <p>Created: {new Date(pass.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(pass.id)} style={{ backgroundColor: '#dc3545' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {passes.length === 0 && <p>No passes found. Create your first pass request!</p>}
      </div>
    </div>
  );
}

export default Passes;
