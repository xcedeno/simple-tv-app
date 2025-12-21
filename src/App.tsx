// src/App.tsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { AccountForm } from './components/AccountForm';
import { AccountList } from './components/AccountList';
import { AccountCardsScreen } from './components/AccountCardsScreen';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { EquipmentManagement } from './components/EquipmentManagement';
import { TechnicalSupport } from './components/TechnicalSupport';
import MiniDrawer from './components/MiniDrawer';
import { FloatingNav } from './components/FloatingNav';

function App() {
  const [refresh, setRefresh] = React.useState(false);

  // Función para forzar la actualización de la lista de cuentas
  const handleSaved = () => {
    setRefresh((prev) => !prev); // Alternar el estado de refresh
  };

  return (
    <Router>
      <MiniDrawer>
        <FloatingNav />
        <Routes>
          {/* Dashboard */}
          {/* Dashboard (Principal) */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Formulario de Cuentas */}
          <Route
            path="/form"
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

          {/* Página de Reportes */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* Gestión de Equipos */}
          <Route
            path="/equipment"
            element={<EquipmentManagement />}
          />

          {/* Soporte Técnico */}
          <Route
            path="/support"
            element={<TechnicalSupport />}
          />
        </Routes>
      </MiniDrawer>
    </Router>
  );
}

export default App;