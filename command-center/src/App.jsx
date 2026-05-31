import React, { useState } from 'react';
import MapView from './components/Map';
import './App.css';

function App() {
  const [operator, setOperator] = useState('ALL');

  return (
    <div className="App">
      <header className="header">
        <h1>Centre de Commandement</h1>
        <div className="filters">
          <label htmlFor="operator-select">Opérateur : </label>
          <select 
            id="operator-select" 
            value={operator} 
            onChange={(e) => setOperator(e.target.value)}
          >
            <option value="ALL">Tous</option>
            <option value="DDD">Dakar Dem Dikk</option>
            <option value="AFTU">AFTU</option>
          </select>
        </div>
      </header>
      <main>
        <MapView operatorFilter={operator} />
      </main>
    </div>
  );
}

export default App;
