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
import { Dashboard } from './components/Dashboard';

function App() {
  const [refresh, setRefresh] = React.useState(false);

  // Función para forzar la actualización de la lista de cuentas
  const handleSaved = () => {
    setRefresh((prev) => !prev); // Alternar el estado de refresh
  };

  return (
    <Router>
      {/* Contenedor Principal */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Barra de Navegación (Header) */}
        <Box sx={{ p: 2 }}>
          <AppBar
            position="static"
            sx={{
              borderRadius: '16px',
              background: 'linear-gradient(90deg, #1a237e 0%, #283593 50%, #0d47a1 100%)',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
            }}
          >
            <Toolbar>
              {/* Título del Encabezado */}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: '1px' }}>
                Gestor de Cuentas
              </Typography>

              {/* Enlaces de Navegación */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[
                  { label: 'Dashboard', to: '/dashboard' },
                  { label: 'Formulario', to: '/' },
                  { label: 'Lista', to: '/list' },
                  { label: 'Tarjetas', to: '/cards' },
                ].map((item) => (
                  <Button
                    key={item.to}
                    color="inherit"
                    component={Link}
                    to={item.to}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Toolbar>
          </AppBar>
        </Box>

        {/* Rutas */}
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

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