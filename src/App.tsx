// src/App.tsx

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
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
      {/* Contenedor Principal */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Barra de Navegación (Header) */}
        <AppBar position="static" color="primary" sx={{ width: '100%' }}>
          <Toolbar>
            {/* Título del Encabezado */}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Gestor de Cuentas
            </Typography>

            {/* Enlaces de Navegación */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" component={Link} to="/">
                Formulario de Cuentas
              </Button>
              <Button color="inherit" component={Link} to="/list">
                Lista de Cuentas
              </Button>
              <Button color="inherit" component={Link} to="/cards">
                Tarjetas de Cuentas
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Rutas */}
        <div style={{ flex: 1 }}>
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
      </div>
    </Router>
  );
}

export default App;