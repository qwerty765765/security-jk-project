import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [apartment, setApartment] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Данные для заявок на пропуск
  const [passes, setPasses] = useState([]);
  const [newPass, setNewPass] = useState({
    visitor_name: '',
    purpose: '',
    date_from: '',
    date_to: ''
  });
  
  // Данные для инцидентов
  const [incidents, setIncidents] = useState([]);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'medium',
    location: ''
  });

  // Админские данные
  const [allPasses, setAllPasses] = useState([]);
  const [users, setUsers] = useState([]);

  const getDashboard = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        if (data.is_admin) {
          setMessage(`Добро пожаловать, Администратор ${data.full_name}!`);
        } else {
          setMessage(`Добро пожаловать, ${data.full_name}!`);
        }
      }
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
    }
  }, [token]);

  const fetchPasses = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/passes/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPasses(data);
    } catch (error) {
      console.error('Ошибка получения заявок:', error);
    }
  }, [token]);

  const fetchAllPasses = useCallback(async () => {
    if (!token || !user?.is_admin) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/passes/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAllPasses(data);
    } catch (error) {
      console.error('Ошибка получения всех заявок:', error);
    }
  }, [token, user]);

  const fetchIncidents = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:8000/api/incidents/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Ошибка получения инцидентов:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      getDashboard();
      fetchPasses();
      fetchIncidents();
      if (user?.is_admin) {
        fetchAllPasses();
      }
    }
  }, [token, getDashboard, fetchPasses, fetchIncidents, fetchAllPasses, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Вход...');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        setToken(data.access_token);
        setMessage('✅ Вход выполнен успешно!');
        setEmail('');
        setPassword('');
      } else {
        setMessage('❌ Ошибка входа: ' + (data.detail || 'Неверный email или пароль'));
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('Регистрация...');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          full_name: fullName, 
          password,
          apartment_number: apartment 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Регистрация успешна! Теперь вы можете войти.');
        setIsLogin(true);
        setFullName('');
        setApartment('');
        setEmail('');
        setPassword('');
      } else {
        setMessage('❌ Ошибка регистрации: ' + (data.detail || 'Попробуйте другой email'));
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    }
  };

  const handleCreatePass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/passes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPass)
      });
      
      if (response.ok) {
        setMessage('✅ Заявка на пропуск создана!');
        setNewPass({ visitor_name: '', purpose: '', date_from: '', date_to: '' });
        fetchPasses();
      } else {
        setMessage('❌ Не удалось создать заявку');
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    }
  };

  const handleDeletePass = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить заявку?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/passes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setMessage('✅ Заявка удалена!');
        fetchPasses();
        if (user?.is_admin) fetchAllPasses();
      } else {
        setMessage('❌ Не удалось удалить заявку');
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    }
  };

  const handleUpdatePassStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:8000/api/passes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setMessage(`✅ Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}!`);
        fetchAllPasses();
      } else {
        setMessage('❌ Не удалось обновить статус');
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/incidents/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIncident)
      });
      
      if (response.ok) {
        setMessage('✅ Инцидент зарегистрирован!');
        setNewIncident({ title: '', description: '', severity: 'medium', location: '' });
        fetchIncidents();
      } else {
        setMessage('❌ Не удалось зарегистрировать инцидент');
      }
    } catch (error) {
      setMessage('❌ Ошибка: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    setMessage('Выход выполнен');
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      default: return 'На рассмотрении';
    }
  };

  const getSeverityText = (severity) => {
    switch(severity) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return severity;
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Безопасность ЖК</h1>
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => { setIsLogin(true); setMessage(''); }}
            style={{ marginRight: '10px', padding: '10px 20px', background: isLogin ? '#007bff' : '#ccc', border: 'none', cursor: 'pointer' }}
          >
            Вход
          </button>
          <button 
            onClick={() => { setIsLogin(false); setMessage(''); }}
            style={{ padding: '10px 20px', background: !isLogin ? '#007bff' : '#ccc', border: 'none', cursor: 'pointer' }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          {!isLogin && (
            <>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="ФИО"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Номер квартиры"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </>
          )}
          
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        
        {message && (
          <div style={{ marginTop: '20px', padding: '10px', background: message.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ background: '#2c3e50', color: 'white', padding: '15px', marginBottom: '20px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => setActiveTab('dashboard')} style={{ marginRight: '10px', padding: '10px 20px', background: activeTab === 'dashboard' ? '#007bff' : '#555', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
            📊 Главная
          </button>
          <button onClick={() => setActiveTab('passes')} style={{ marginRight: '10px', padding: '10px 20px', background: activeTab === 'passes' ? '#007bff' : '#555', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
            🎫 Мои пропуска
          </button>
          <button onClick={() => setActiveTab('incidents')} style={{ padding: '10px 20px', background: activeTab === 'incidents' ? '#007bff' : '#555', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
            ⚠️ Инциденты
          </button>
          {user?.is_admin && (
            <button onClick={() => setActiveTab('admin')} style={{ marginLeft: '10px', padding: '10px 20px', background: activeTab === 'admin' ? '#dc3545' : '#555', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
              👑 Админ-панель
            </button>
          )}
        </div>
        <div>
          <span style={{ marginRight: '15px' }}>
            👤 {user?.full_name} {user?.apartment_number && `(кв. ${user.apartment_number})`}
            {user?.is_admin && <span style={{ marginLeft: '10px', background: '#dc3545', padding: '3px 8px', borderRadius: '3px', fontSize: '12px' }}>АДМИН</span>}
          </span>
          <button onClick={handleLogout} style={{ padding: '5px 15px', background: '#dc3545', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>Выйти</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div>
          <h2>📊 Панель управления</h2>
          {user?.is_admin && (
            <div style={{ background: '#e8f4f8', borderLeft: '4px solid #007bff', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
              <strong>👑 Вы вошли как администратор!</strong> Вам доступна админ-панель для управления всеми заявками.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h3 style={{ margin: 0 }}>🎫 Мои заявки</h3>
              <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0' }}>{passes.length}</p>
              <p style={{ margin: 0 }}>Всего заявок</p>
            </div>
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <h3 style={{ margin: 0 }}>⚠️ Инциденты</h3>
              <p style={{ fontSize: '48px', fontWeight: 'bold', margin: '10px 0' }}>{incidents.length}</p>
              <p style={{ margin: 0 }}>Всего инцидентов</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'passes' && (
        <div>
          <h2>🎫 Мои заявки на пропуск</h2>
          
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#f9f9f9' }}>
            <h3>➕ Новая заявка</h3>
            <form onSubmit={handleCreatePass}>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Имя посетителя"
                  value={newPass.visitor_name}
                  onChange={(e) => setNewPass({...newPass, visitor_name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Цель визита"
                  value={newPass.purpose}
                  onChange={(e) => setNewPass({...newPass, purpose: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="date"
                  value={newPass.date_from}
                  onChange={(e) => setNewPass({...newPass, date_from: e.target.value})}
                  required
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
                <input
                  type="date"
                  value={newPass.date_to}
                  onChange={(e) => setNewPass({...newPass, date_to: e.target.value})}
                  required
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>📝 Отправить заявку</button>
            </form>
          </div>

          <div>
            <h3>📋 Список заявок</h3>
            {passes.map(pass => (
              <div key={pass.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', marginBottom: '10px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0' }}>{pass.visitor_name}</h4>
                    <p style={{ margin: '5px 0' }}><strong>Цель:</strong> {pass.purpose || 'Не указана'}</p>
                    <p style={{ margin: '5px 0' }}><strong>Период:</strong> {pass.date_from} — {pass.date_to}</p>
                    <p style={{ margin: '5px 0' }}><strong>Статус:</strong> <span style={{ 
                      color: pass.status === 'approved' ? 'green' : pass.status === 'rejected' ? 'red' : 'orange',
                      fontWeight: 'bold'
                    }}>{getStatusText(pass.status)}</span></p>
                  </div>
                  <button onClick={() => handleDeletePass(pass.id)} style={{ padding: '5px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Удалить</button>
                </div>
              </div>
            ))}
            {passes.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Нет заявок. Создайте первую заявку на пропуск!</p>}
          </div>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div>
          <h2>⚠️ Сообщения об инцидентах</h2>
          
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#f9f9f9' }}>
            <h3>➕ Сообщить об инциденте</h3>
            <form onSubmit={handleCreateIncident}>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Заголовок"
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <textarea
                  placeholder="Описание"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', minHeight: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Место происшествия"
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({...newIncident, severity: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                >
                  <option value="low">🟢 Низкий</option>
                  <option value="medium">🟡 Средний</option>
                  <option value="high">🔴 Высокий</option>
                </select>
              </div>
              <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>📢 Сообщить</button>
            </form>
          </div>

          <div>
            <h3>📋 Список инцидентов</h3>
            {incidents.map(incident => (
              <div key={incident.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '10px', 
                marginBottom: '10px', 
                background: 'white',
                borderLeft: `4px solid ${incident.severity === 'high' ? '#dc3545' : incident.severity === 'medium' ? '#ffc107' : '#28a745'}`
              }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{incident.title}</h4>
                <p style={{ margin: '5px 0' }}>{incident.description}</p>
                {incident.location && <p style={{ margin: '5px 0' }}><strong>📍 Место:</strong> {incident.location}</p>}
                <p style={{ margin: '5px 0' }}><strong>⚠️ Важность:</strong> <span style={{ 
                  color: incident.severity === 'high' ? '#dc3545' : incident.severity === 'medium' ? '#ffc107' : '#28a745',
                  fontWeight: 'bold'
                }}>{getSeverityText(incident.severity)}</span></p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}><strong>📅 Дата:</strong> {new Date(incident.created_at).toLocaleString('ru-RU')}</p>
              </div>
            ))}
            {incidents.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Нет инцидентов. Будьте бдительны!</p>}
          </div>
        </div>
      )}

      {activeTab === 'admin' && user?.is_admin && (
        <div>
          <h2>👑 Админ-панель</h2>
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>📋 Все заявки на пропуск</h3>
            <p>Здесь вы можете управлять всеми заявками жильцов</p>
          </div>
          
          {allPasses.map(pass => (
            <div key={pass.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', marginBottom: '10px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0' }}>{pass.visitor_name}</h4>
                  <p style={{ margin: '5px 0' }}><strong>Цель:</strong> {pass.purpose || 'Не указана'}</p>
                  <p style={{ margin: '5px 0' }}><strong>Период:</strong> {pass.date_from} — {pass.date_to}</p>
                  <p style={{ margin: '5px 0' }}><strong>Статус:</strong> <span style={{ 
                    color: pass.status === 'approved' ? 'green' : pass.status === 'rejected' ? 'red' : 'orange',
                    fontWeight: 'bold'
                  }}>{getStatusText(pass.status)}</span></p>
                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}><strong>ID заявки:</strong> {pass.id}</p>
                </div>
                <div>
                  {pass.status === 'pending' && (
                    <div>
                      <button 
                        onClick={() => handleUpdatePassStatus(pass.id, 'approved')}
                        style={{ padding: '5px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}
                      >
                        ✅ Одобрить
                      </button>
                      <button 
                        onClick={() => handleUpdatePassStatus(pass.id, 'rejected')}
                        style={{ padding: '5px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                      >
                        ❌ Отклонить
                      </button>
                    </div>
                  )}
                  {pass.status !== 'pending' && (
                    <span style={{ color: pass.status === 'approved' ? 'green' : 'red', fontWeight: 'bold' }}>
                      {pass.status === 'approved' ? '✓ Одобрено' : '✗ Отклонено'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {allPasses.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Нет заявок для рассмотрения</p>}
        </div>
      )}

      {message && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          padding: '12px 20px', 
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '5px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
