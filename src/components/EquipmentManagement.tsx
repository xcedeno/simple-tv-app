import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Router } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const EquipmentManagement: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#1a237e' }}>
                Gestión de Equipos
            </Typography>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
                <Router sx={{ fontSize: 60, color: '#1a237e', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                    Módulo de Gestión de Equipos
                </Typography>
                <Button
                    variant="contained"
                    component={Link}
                    to="/inventory"
                    sx={{ borderRadius: '12px' }}
                >
                    Ir al Inventario de Equipos
                </Button>
            </Paper>
        </Box>
    );
};
