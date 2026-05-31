import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [busId, setBusId] = useState('');
  const [operator, setOperator] = useState('DDD');
  const [isConnected, setIsConnected] = useState(false);
  const [location, setLocation] = useState({ lat: 14.6928, lng: -17.4467 });
  const [status, setStatus] = useState('En service');

  useEffect(() => {
    let interval;
    if (isConnected) {
      // Simulate movement
      interval = setInterval(() => {
        setLocation(prev => {
          const newLat = prev.lat + (Math.random() - 0.5) * 0.005;
          const newLng = prev.lng + (Math.random() - 0.5) * 0.005;
          const loc = { lat: newLat, lng: newLng };
          socket.emit('driver-location', {
            busId,
            operator,
            status,
            ...loc
          });
          return loc;
        });
      }, 3000); // update every 3s
    }
    return () => clearInterval(interval);
  }, [isConnected, busId, operator, status]);

  const handleStart = () => {
    if (busId.trim()) {
      setIsConnected(true);
      // initial ping
      socket.emit('driver-location', { busId, operator, status, ...location });
    } else {
      alert('Veuillez entrer un ID de bus');
    }
  };

  const handleStop = () => {
    setIsConnected(false);
    socket.emit('driver-location', { busId, operator, status: 'Hors ligne', ...location });
  };

  const handleSOS = () => {
    socket.emit('driver-alert', { busId, operator, message: 'Urgence SOS déclenchée !' });
    alert('Alerte SOS envoyée au centre de commandement.');
  };

  return (
    <div className="App">
      <header>
        <h1>Application Chauffeur</h1>
      </header>
      {!isConnected ? (
        <div className="login-form">
          <input 
            type="text" 
            placeholder="ID du Bus (ex: DDD-001)" 
            value={busId} 
            onChange={e => setBusId(e.target.value)} 
          />
          <select value={operator} onChange={e => setOperator(e.target.value)}>
            <option value="DDD">Dakar Dem Dikk</option>
            <option value="AFTU">AFTU</option>
          </select>
          <button onClick={handleStart}>Prendre le service</button>
        </div>
      ) : (
        <div className="dashboard">
          <h2>Bus: {busId} ({operator})</h2>
          <p>Statut: {status}</p>
          <div className="status-controls">
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="En service">En service</option>
              <option value="En pause">En pause</option>
              <option value="En panne">En panne</option>
            </select>
          </div>
          <button className="sos-btn" onClick={handleSOS}>🚨 ALERTE SOS</button>
          <button className="stop-btn" onClick={handleStop}>Fin de service</button>
          <div className="map-placeholder">
            Position envoyée : {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
