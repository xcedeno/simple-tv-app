// src/components/AccountCard.tsx

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material';
import dayjs from 'dayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Interfaz para los datos de la tarjeta
interface AccountCardProps {
    alias: string;
    nearestCutoffDate: string; // Fecha de corte más próxima en formato ISO (YYYY-MM-DD)
    roomNumbers: string[]; // Lista de números de habitación asociados al alias
}

export const AccountCard: React.FC<AccountCardProps> = ({ alias, nearestCutoffDate, roomNumbers }) => {
    // Función para calcular los días restantes
    const getDaysRemaining = (cutoffDate: string): number => {
        const today = dayjs();
        const cutoff = dayjs(cutoffDate);
        return cutoff.diff(today, 'day'); // Diferencia en días
    };

    // Obtener los días restantes
    const daysRemaining = getDaysRemaining(nearestCutoffDate);

    // Determinar el estado y color
    const getStatusInfo = (days: number) => {
        if (days < 0) return { label: 'Vencido', color: '#d32f2f', bgColor: '#ffebee' };
        if (days <= 5) return { label: 'Por Vencer', color: '#f57c00', bgColor: '#fff3e0' };
        return { label: 'Activo', color: '#2e7d32', bgColor: '#e8f5e9' };
    };

    const status = getStatusInfo(daysRemaining);

    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                },
                border: '1px solid rgba(0,0,0,0.05)',
                background: '#fff',
                overflow: 'visible',
                position: 'relative'
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Header con Alias y Estado */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography variant="overline" color="textSecondary" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                            CUENTA
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e', lineHeight: 1.2 }}>
                            {alias}
                        </Typography>
                    </Box>
                    <Chip
                        label={status.label}
                        sx={{
                            backgroundColor: status.bgColor,
                            color: status.color,
                            fontWeight: 700,
                            borderRadius: '8px',
                            height: '28px'
                        }}
                    />
                </Box>

                <Divider sx={{ my: 2, opacity: 0.6 }} />

                {/* Información de Fecha */}
                <Box display="flex" alignItems="center" mb={2}>
                    <Box
                        sx={{
                            backgroundColor: '#e3f2fd',
                            borderRadius: '12px',
                            p: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CalendarTodayIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                            Próximo Corte
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                            {dayjs(nearestCutoffDate).format('DD MMM YYYY')}
                        </Typography>
                    </Box>
                </Box>

                {/* Información de Habitaciones */}
                <Box display="flex" alignItems="center" mb={3}>
                    <Box
                        sx={{
                            backgroundColor: '#f3e5f5',
                            borderRadius: '12px',
                            p: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <MeetingRoomIcon sx={{ color: '#7b1fa2', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                            Habitaciones
                        </Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {roomNumbers.length > 0 ? roomNumbers.join(', ') : 'Sin asignar'}
                        </Typography>
                    </Box>
                </Box>

                {/* Footer con Días Restantes */}
                <Box
                    sx={{
                        backgroundColor: status.bgColor,
                        borderRadius: '12px',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <AccessTimeIcon sx={{ color: status.color, fontSize: 18, mr: 1 }} />
                    <Typography variant="body2" sx={{ color: status.color, fontWeight: 600 }}>
                        {daysRemaining < 0
                            ? `Vencido hace ${Math.abs(daysRemaining)} días`
                            : daysRemaining === 0
                                ? 'Vence hoy'
                                : `Vence en ${daysRemaining} días`}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};