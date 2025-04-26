// src/App.tsx
import React from 'react';
import { AccountForm } from './components/AccountForm';
import { AccountList } from './components/AccountList';

function App() {
  const [refresh, setRefresh] = React.useState(false);

  const handleSaved = () => {
    setRefresh((prev) => !prev); // Forzar actualización
  };

  return (
    <div>
      <h1>Administrador de Cuentas</h1>
      <AccountForm onSaved={handleSaved} />
      <AccountList refresh={refresh} />
    </div>
  );
}

export default App;