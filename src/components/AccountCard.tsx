// src/components/AccountCard.tsx

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import dayjs from 'dayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';

// Interfaz para los datos de la tarjeta
interface AccountCardProps {
    alias: string;
    email: string;
    nearestCutoffDate: string; // Fecha de corte más próxima en formato ISO (YYYY-MM-DD)
    roomNumbers: string[]; // Lista de números de habitación asociados al alias
}

export const AccountCard: React.FC<AccountCardProps> = ({ alias, email, nearestCutoffDate, roomNumbers }) => {
    // Función para calcular los días restantes
    const getDaysRemaining = (cutoffDate: string): number => {
        const today = dayjs();
        const cutoff = dayjs(cutoffDate);
        return cutoff.diff(today, 'day'); // Diferencia en días
    };

    // Obtener los días restantes
    const daysRemaining = getDaysRemaining(nearestCutoffDate);

    const theme = useTheme();

    // Determinar el estado y color
    const getStatusInfo = (days: number) => {
        if (days < 0) return { label: 'Vencido', color: theme.palette.error.main, bgColor: alpha(theme.palette.error.main, 0.1) };
        if (days <= 5) return { label: 'Por Vencer', color: theme.palette.warning.main, bgColor: alpha(theme.palette.warning.main, 0.1) };
        return { label: 'Activo', color: theme.palette.success.main, bgColor: alpha(theme.palette.success.main, 0.1) };
    };

    const status = getStatusInfo(daysRemaining);

    const handleWhatsApp = () => {
        const message = `Hola ${alias}, te recordamos que tu cuenta vence el ${dayjs(nearestCutoffDate).format('DD/MM/YYYY')} (${daysRemaining} días restantes). Por favor realiza tu pago.`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleEmail = () => {
        const subject = `Recordatorio de Vencimiento - Cuenta ${alias}`;
        const body = `Hola ${alias},\n\nTe recordamos que tu cuenta vence el ${dayjs(nearestCutoffDate).format('DD/MM/YYYY')} (${daysRemaining} días restantes).\n\nPor favor realiza tu pago para evitar cortes.\n\nSaludos.`;
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    };

    return (
        <Card
            sx={{
                height: '100%',
                borderRadius: '20px',
                boxShadow: theme.palette.mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 15px 35px rgba(0,0,0,0.6)' : '0 15px 35px rgba(0,0,0,0.1)',
                },
                border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                // Removed hardcoded background to let MUI Paper handle it based on theme
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
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
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

                <Divider sx={{ my: 2, opacity: 0.1 }} />

                {/* Información de Fecha */}
                <Box display="flex" alignItems="center" mb={2}>
                    <Box
                        sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            borderRadius: '12px',
                            p: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CalendarTodayIcon color="primary" sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                            Próximo Corte
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="textPrimary">
                            {dayjs(nearestCutoffDate).format('DD MMM YYYY')}
                        </Typography>
                    </Box>
                </Box>

                {/* Información de Habitaciones */}
                <Box display="flex" alignItems="center" mb={3}>
                    <Box
                        sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            borderRadius: '12px',
                            p: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <MeetingRoomIcon color="secondary" sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" color="textSecondary" display="block">
                            Habitaciones
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color="textPrimary" sx={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {roomNumbers.length > 0 ? roomNumbers.join(', ') : 'Sin asignar'}
                        </Typography>
                    </Box>
                </Box>

                {/* Footer con Días Restantes y Botones */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                    <Box
                        sx={{
                            backgroundColor: status.bgColor,
                            borderRadius: '12px',
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1,
                            mr: 2
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
                    <Box display="flex" gap={1}>
                        <Tooltip title="Enviar WhatsApp">
                            <IconButton size="small" onClick={handleWhatsApp} sx={{ color: '#25D366', backgroundColor: alpha('#25D366', 0.1), '&:hover': { backgroundColor: alpha('#25D366', 0.2) } }}>
                                <WhatsAppIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Enviar Correo">
                            <IconButton size="small" onClick={handleEmail} sx={{ color: theme.palette.info.main, backgroundColor: alpha(theme.palette.info.main, 0.1), '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.2) } }}>
                                <EmailIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};