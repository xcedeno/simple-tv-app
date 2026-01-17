import React from 'react';
import { Box, Grid, Card, Typography, useTheme, Chip, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

// Mock Data
const ticketStats = [
    { name: 'Pendientes', value: 12, color: '#f59e0b' },
    { name: 'En Proceso', value: 8, color: '#3b82f6' },
    { name: 'Resueltos', value: 24, color: '#10b981' },
    { name: 'Cancelados', value: 3, color: '#ef4444' },
];

const priorityData = [
    { name: 'Baja', tickets: 15 },
    { name: 'Media', tickets: 20 },
    { name: 'Alta', tickets: 10 },
    { name: 'Crítica', tickets: 2 },
];

const weeklyTrend = [
    { day: 'Lun', created: 4, resolved: 3 },
    { day: 'Mar', created: 3, resolved: 5 },
    { day: 'Mié', created: 6, resolved: 4 },
    { day: 'Jue', created: 2, resolved: 6 },
    { day: 'Vie', created: 5, resolved: 4 },
    { day: 'Sáb', created: 1, resolved: 2 },
    { day: 'Dom', created: 0, resolved: 1 },
];

const recentActivity = [
    { id: 1, title: 'TV Hab 203 sin señal', status: 'En Proceso', time: 'Hace 2 horas', priority: 'Media' },
    { id: 2, title: 'Control remoto dañado Lobby', status: 'Pendiente', time: 'Hace 4 horas', priority: 'Baja' },
    { id: 3, title: 'Fuga de agua baño 305', status: 'Crítica', time: 'Hace 5 horas', priority: 'Crítica' },
    { id: 4, title: 'Wifi lento piso 4', status: 'Resuelto', time: 'Ayer', priority: 'Alta' },
];

const StatCard = ({ title, value, icon, color, bgcolor }: any) => (
    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, boxShadow: 2, bgcolor: bgcolor || 'background.paper' }}>
        <Avatar sx={{ bgcolor: color, mr: 2, width: 56, height: 56 }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Card>
);

const SupportDashboard: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>
                Dashboard de Soporte Técnico
            </Typography>

            {/* Top Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Total Tickets" value="47" icon={<AssignmentIcon />} color={theme.palette.primary.main} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Pendientes" value="12" icon={<PendingIcon />} color={theme.palette.warning.main} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Alta Prioridad" value="12" icon={<AssignmentLateIcon />} color={theme.palette.error.main} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard title="Resueltos (Semana)" value="25" icon={<CheckCircleIcon />} color={theme.palette.success.main} />
                </Grid>
            </Grid>

            {/* Charts Row 1 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Weekly Trend Line Chart */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tendencia Semanal</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="day" stroke={theme.palette.text.secondary} />
                                <YAxis stroke={theme.palette.text.secondary} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: theme.palette.background.paper, borderRadius: 8 }}
                                    itemStyle={{ color: theme.palette.text.primary }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="created" name="Creados" stroke={theme.palette.primary.main} strokeWidth={3} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="resolved" name="Resueltos" stroke={theme.palette.success.main} strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Status Pie Chart */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Estado de Tickets</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={ticketStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ticketStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Charts Row 2 & Recent Activity */}
            <Grid container spacing={3}>
                {/* Priority Bar Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tickets por Prioridad</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={priorityData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                                <XAxis type="number" stroke={theme.palette.text.secondary} />
                                <YAxis dataKey="name" type="category" stroke={theme.palette.text.secondary} width={70} />
                                <RechartsTooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="tickets" fill={theme.palette.secondary.main} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Recent Activity List */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 0, borderRadius: 3, boxShadow: 2, overflow: 'hidden', height: '100%' }}>
                        <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb', borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">Actividad Reciente</Typography>
                        </Box>
                        <List sx={{ p: 0 }}>
                            {recentActivity.map((activity) => (
                                <React.Fragment key={activity.id}>
                                    <ListItem alignItems="flex-start" sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' } }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{
                                                bgcolor: activity.priority === 'Crítica' ? theme.palette.error.light : theme.palette.primary.light,
                                                color: activity.priority === 'Crítica' ? theme.palette.error.contrastText : theme.palette.primary.contrastText
                                            }}>
                                                {activity.priority === 'Crítica' ? '!' : '#'}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography fontWeight="500" component="span">{activity.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5, display: 'flex', gap: 1 }}>
                                                    <Chip label={activity.status} size="small" color={activity.status === 'Resuelto' ? 'success' : 'default'} variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    <Chip label={activity.priority} size="small"
                                                        sx={{
                                                            height: 20, fontSize: '0.7rem',
                                                            bgcolor: activity.priority === 'Crítica' ? theme.palette.error.dark : undefined,
                                                            color: activity.priority === 'Crítica' ? 'white' : undefined
                                                        }}
                                                    />
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SupportDashboard;
