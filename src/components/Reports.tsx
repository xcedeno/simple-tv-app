import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import {
    AttachMoney,
    Warning,
    CheckCircle,
    Room,
    WhatsApp,
    Email
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';

interface Device {
    decoder_id: string;
    balance: number;
    cutoff_date: string;
    room_number: string;
}

interface Account {
    email: string;
    alias: string;
    devices: Device[];
}

interface ExpiringDevice {
    decoder: string;
    date: string;
    daysLeft: number;
}

interface ExpiringAccount {
    alias: string;
    email: string;
    devices: ExpiringDevice[];
    minDaysLeft: number;
}

const calculateBalanceFromCutoff = (cutoffDate: string): number => {
    const serviceDayValue = 0.8;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const cutoff = new Date(cutoffDate);
    cutoff.setUTCHours(0, 0, 0, 0);

    if (cutoff < today) {
        return 0;
    }

    const diffTime = cutoff.getTime() - today.getTime();
    // +1 para incluir el día de hoy en el cálculo de días restantes.
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const balance = diffDays * serviceDayValue;
    return balance;
};

export const Reports: React.FC = () => {
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalBalance: 0,
        avgBalance: 0,
        activeDevices: 0,
        expiredDevices: 0,
        expiringSoon: [] as ExpiringAccount[],
        devicesByRoom: {} as Record<string, number>
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*');

            if (error) throw error;

            if (data) {

                calculateStats(data as Account[]);
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: Account[]) => {
        let totalBalance = 0;
        let totalDevices = 0;
        let active = 0;
        let expired = 0;
        const expiringByAlias: Record<string, { email: string; devices: { decoder: string; date: string; daysLeft: number }[] }> = {};
        const byRoom: Record<string, number> = {};
        const today = dayjs();

        data.forEach(acc => {
            if (acc.devices && Array.isArray(acc.devices)) {
                acc.devices.forEach((dev: Device) => {
                    // Financials - Usamos el cálculo dinámico basado en la fecha de corte
                    totalBalance += calculateBalanceFromCutoff(dev.cutoff_date);
                    totalDevices++;

                    // Status
                    const cutoff = dayjs(dev.cutoff_date);
                    const daysDiff = cutoff.diff(today, 'day');

                    if (daysDiff < 0) {
                        expired++;
                    } else {
                        active++;
                    }

                    // Expirations (Next 30 days)
                    if (daysDiff >= 0 && daysDiff <= 30) {
                        const alias = acc.alias || acc.email;
                        if (!expiringByAlias[alias]) {
                            expiringByAlias[alias] = {
                                email: acc.email,
                                devices: []
                            };
                        }
                        expiringByAlias[alias].devices.push({
                            decoder: dev.decoder_id,
                            date: dev.cutoff_date,
                            daysLeft: daysDiff
                        });
                    }

                    // Rooms
                    const room = dev.room_number || 'Sin Asignar';
                    byRoom[room] = (byRoom[room] || 0) + 1;
                });
            }
        });

        const expiring: ExpiringAccount[] = Object.entries(expiringByAlias).map(([alias, data]) => {
            const minDaysLeft = Math.min(...data.devices.map(d => d.daysLeft));
            return {
                alias,
                email: data.email,
                devices: data.devices.sort((a, b) => a.daysLeft - b.daysLeft), // Sort devices within the account
                minDaysLeft
            };
        });

        // Sort expiring by days left
        expiring.sort((a, b) => a.minDaysLeft - b.minDaysLeft);

        setStats({
            totalBalance,
            avgBalance: totalDevices > 0 ? totalBalance / totalDevices : 0,
            activeDevices: active,
            expiredDevices: expired,
            expiringSoon: expiring,
            devicesByRoom: byRoom
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: '1600px', margin: '0 auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#1a237e' }}>
                Reportes y Estadísticas
            </Typography>

            <Grid container spacing={3}>
                {/* Financial Summary */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', color: 'white' }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <AttachMoney sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Resumen Financiero</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>Saldo Total Acumulado</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    ${stats.totalBalance.toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>Promedio por Dispositivo</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    ${stats.avgBalance.toFixed(2)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Status Summary */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: '20px', height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#424242' }}>
                            Estado de la Cartera
                        </Typography>
                        <Box display="flex" justifyContent="space-around" alignItems="center">
                            <Box textAlign="center">
                                <CircularProgress
                                    variant="determinate"
                                    value={100}
                                    size={80}
                                    sx={{ color: '#e0e0e0', position: 'absolute' }}
                                />
                                <CircularProgress
                                    variant="determinate"
                                    value={(stats.activeDevices / (stats.activeDevices + stats.expiredDevices)) * 100 || 0}
                                    size={80}
                                    color="success"
                                />
                                <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                                    {stats.activeDevices}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">Activos</Typography>
                            </Box>
                            <Box textAlign="center">
                                <CircularProgress
                                    variant="determinate"
                                    value={100}
                                    size={80}
                                    sx={{ color: '#e0e0e0', position: 'absolute' }}
                                />
                                <CircularProgress
                                    variant="determinate"
                                    value={(stats.expiredDevices / (stats.activeDevices + stats.expiredDevices)) * 100 || 0}
                                    size={80}
                                    color="error"
                                />
                                <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold', color: '#c62828' }}>
                                    {stats.expiredDevices}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">Vencidos</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Expiring Soon Table */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: '20px', overflow: 'hidden' }}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Warning color="warning" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={700}>
                                Próximos Vencimientos (30 días)
                            </Typography>
                        </Box>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Cliente</TableCell>
                                        <TableCell>Decodificador</TableCell>
                                        <TableCell>Fecha Corte</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Notificar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.expiringSoon.length > 0 ? (
                                        stats.expiringSoon.map((account, accIndex) => (
                                            <React.Fragment key={accIndex}>
                                                {account.devices.map((device, devIndex) => {
                                                    return (
                                                        <TableRow key={`${accIndex}-${devIndex}`} hover>
                                                            {devIndex === 0 && (
                                                                <TableCell rowSpan={account.devices.length} sx={{ fontWeight: 500, verticalAlign: 'top' }}>
                                                                    {account.alias}
                                                                </TableCell>
                                                            )}
                                                            <TableCell>{device.decoder}</TableCell>
                                                            <TableCell>{dayjs(device.date).format('DD/MM/YYYY')}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={device.daysLeft === 0 ? 'Vence Hoy' : `${device.daysLeft} días`}
                                                                    color={device.daysLeft <= 7 ? 'error' : 'warning'}
                                                                    size="small"
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            </TableCell>
                                                            {devIndex === 0 && (
                                                                <TableCell rowSpan={account.devices.length} sx={{ verticalAlign: 'top' }}>
                                                                    <Box display="flex" flexDirection="column" gap={1}>
                                                                        <Tooltip title="Enviar WhatsApp (resumen)">
                                                                            <IconButton size="small" color="success" onClick={() => {
                                                                                const devicesInfo = account.devices.map(d => `Deco: ${d.decoder} - Vence: ${dayjs(d.date).format('DD/MM/YYYY')} (${d.daysLeft} días)`).join('\n');
                                                                                const message = `Hola ${account.alias}, te recordamos los próximos vencimientos de tus decodificadores:\n\n${devicesInfo}\n\nPor favor realiza tu pago para evitar cortes.`;
                                                                                const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                                                                window.open(url, '_blank');
                                                                            }}>
                                                                                <WhatsApp fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Enviar Correo (resumen)">
                                                                            <IconButton size="small" color="primary" onClick={() => {
                                                                                const devicesInfo = account.devices.map(d => `Decodificador ${d.decoder} vence el ${dayjs(d.date).format('DD/MM/YYYY')} (${d.daysLeft} días restantes).`).join('\n');
                                                                                const subject = `Recordatorio de Vencimientos`;
                                                                                const body = `Hola ${account.alias},\n\nTe recordamos los próximos vencimientos de tus decodificadores:\n\n${devicesInfo}\n\nPor favor realiza tu pago para evitar cortes.\n\nSaludos.`;
                                                                                const url = `mailto:${account.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                                                                window.location.href = url;
                                                                            }}>
                                                                                <Email fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                </TableCell>
                                                            )}
                                                        </TableRow>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Box py={3}>
                                                    <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                                                    <Typography>No hay vencimientos próximos</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Room Distribution */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: '20px', height: '100%' }}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Room color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" fontWeight={700}>
                                Por Ubicación
                            </Typography>
                        </Box>
                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                            {Object.entries(stats.devicesByRoom).map(([room, count], index) => (
                                <Box key={index} mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="body2" fontWeight={600}>{room}</Typography>
                                        <Typography variant="body2" color="textSecondary">{count} disp.</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            bgcolor: '#f5f5f5',
                                            borderRadius: 4,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(count / stats.activeDevices + stats.expiredDevices) * 100}%`,
                                                height: '100%',
                                                bgcolor: '#1a237e',
                                                borderRadius: 4
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
