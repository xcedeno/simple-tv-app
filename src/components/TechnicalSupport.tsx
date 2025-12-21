import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { SupportAgent } from '@mui/icons-material';

export const TechnicalSupport: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#1a237e' }}>
                Soporte Técnico
            </Typography>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
                <SupportAgent sx={{ fontSize: 60, color: '#1a237e', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                    Módulo de Soporte Técnico en construcción...
                </Typography>
            </Paper>
        </Box>
    );
};
