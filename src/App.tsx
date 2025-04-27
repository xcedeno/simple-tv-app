// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AccountForm } from './components/AccountForm';
import { AccountList } from './components/AccountList';
import { AccountCardsScreen } from './components/AccountCardsScreen';

function App() {
  const [refresh, setRefresh] = React.useState(false);

  // Función para forzar la actualización de la lista de cuentas
  const handleSaved = () => {
    setRefresh((prev) => !prev); // Alternar el estado de refresh
  };

  return (
    <Router>
      <div>
        {/* Barra de Navegación */}
        <nav className="navbar custom-navbar">
          <Link to="/" style={{ marginRight: '16px' }}>
            Formulario de Cuentas
          </Link>
          <Link to="/list" style={{ marginRight: '16px' }}>
            Lista de Cuentas
          </Link>
          <Link to="/cards">Tarjetas de Cuentas</Link>
        </nav>

        {/* Rutas */}
        <Routes>
          {/* Página Principal: Formulario de Cuentas */}
          <Route
            path="/"
            element={<AccountForm onSaved={handleSaved} />}
          />

          {/* Página de Lista de Cuentas */}
          <Route
            path="/list"
            element={<AccountList refresh={refresh} />}
          />

          {/* Página de Tarjetas de Cuentas */}
          <Route
            path="/cards"
            element={<AccountCardsScreen />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;