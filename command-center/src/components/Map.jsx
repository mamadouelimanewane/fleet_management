import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const socket = io('http://localhost:3001');

const MapView = ({ operatorFilter }) => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    socket.on('buses-update', (data) => {
      setBuses(data);
    });

    socket.on('buses-alert', (data) => {
      alert(`ALERTE BUS ${data.busId}: ${data.message}`);
    });

    return () => {
      socket.off('buses-update');
      socket.off('buses-alert');
    };
  }, []);

  const filteredBuses = operatorFilter === 'ALL' 
    ? buses 
    : buses.filter(b => b.operator === operatorFilter);

  return (
    <MapContainer center={[14.6928, -17.4467]} zoom={13} style={{ height: '80vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {filteredBuses.map((bus) => (
        <Marker key={bus.socketId} position={[bus.lat, bus.lng]}>
          <Popup>
            <strong>Bus ID:</strong> {bus.busId} <br />
            <strong>Opérateur:</strong> {bus.operator} <br />
            <strong>Statut:</strong> {bus.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
