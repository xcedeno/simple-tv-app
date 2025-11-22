import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Box,
    CircularProgress,
    useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface Device {
    cutoff_date: string;
}

export const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAccounts: 0,
        activeDevices: 0,
        expiredDevices: 0,
    });
    const theme = useTheme();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: accounts, error } = await supabase
                    .from('accounts')
                    .select('devices');

                if (error) throw error;

                let totalAccounts = 0;
                let activeDevices = 0;
                let expiredDevices = 0;
                const today = new Date();

                if (accounts) {
                    totalAccounts = accounts.length;
                    accounts.forEach((account: any) => {
                        if (account.devices && Array.isArray(account.devices)) {
                            account.devices.forEach((device: Device) => {
                                const cutoff = new Date(device.cutoff_date);
                                if (cutoff < today) {
                                    expiredDevices++;
                                } else {
                                    activeDevices++;
                                }
                            });
                        }
                    });
                }

                setStats({
                    totalAccounts,
                    activeDevices,
                    expiredDevices,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    const maxVal = Math.max(stats.activeDevices, stats.expiredDevices, 1);
    const activePercent = (stats.activeDevices / maxVal) * 100;
    const expiredPercent = (stats.expiredDevices / maxVal) * 100;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom component="div" sx={{ mb: 4, fontWeight: 'bold', color: theme.palette.primary.main }}>
                Dashboard General
            </Typography>

            <Grid container spacing={3}>
                {/* Estadísticas Rápidas */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Total de Cuentas
                        </Typography>
                        <Typography variant="h2" color="primary">
                            {stats.totalAccounts}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Dispositivos Activos
                        </Typography>
                        <Typography variant="h2" style={{ color: '#4caf50' }}>
                            {stats.activeDevices}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Dispositivos Vencidos
                        </Typography>
                        <Typography variant="h2" style={{ color: '#f44336' }}>
                            {stats.expiredDevices}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Gráfica Simple */}
                <Grid size={{ xs: 12 }}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Estado de Dispositivos
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-end', height: 200, gap: 4, px: 4 }}>
                            {/* Barra Activos */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 100,
                                        height: `${activePercent}%`,
                                        bgcolor: '#4caf50',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 1s ease-in-out',
                                        minHeight: 4 // Para que se vea algo si es 0
                                    }}
                                />
                                <Typography variant="subtitle1" sx={{ mt: 1 }}>Activos ({stats.activeDevices})</Typography>
                            </Box>

                            {/* Barra Vencidos */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: 100,
                                        height: `${expiredPercent}%`,
                                        bgcolor: '#f44336',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 1s ease-in-out',
                                        minHeight: 4
                                    }}
                                />
                                <Typography variant="subtitle1" sx={{ mt: 1 }}>Vencidos ({stats.expiredDevices})</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Tarjetas de Navegación */}
                <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 2 }}>
                        Accesos Rápidos
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={3}>
                        <CardActionArea component={Link} to="/form">
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <AddCircleOutlineIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                                <Typography variant="h6">Nueva Cuenta</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Registrar cuentas y dispositivos
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={3}>
                        <CardActionArea component={Link} to="/list">
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <ListAltIcon sx={{ fontSize: 60, color: theme.palette.secondary.main, mb: 2 }} />
                                <Typography variant="h6">Lista de Cuentas</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Ver y editar cuentas existentes
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={3}>
                        <CardActionArea component={Link} to="/cards">
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <CreditCardIcon sx={{ fontSize: 60, color: '#ff9800', mb: 2 }} />
                                <Typography variant="h6">Tarjetas</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Vista de tarjetas imprimibles
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card elevation={3}>
                        <CardActionArea component={Link} to="/reports">
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <AssessmentIcon sx={{ fontSize: 60, color: '#9c27b0', mb: 2 }} />
                                <Typography variant="h6">Reportes</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Ver estadísticas detalladas
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>

            </Grid>
        </Box>
    );
};
