import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Button, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import TvIcon from '@mui/icons-material/Tv';
import KitchenIcon from '@mui/icons-material/Kitchen';
import InventoryIcon from '@mui/icons-material/Inventory';
import { supabase } from '../supabaseClient';

interface InventoryItem {
    id?: string;
    item_number: number;
    equipment_type: string;
    room_number: string;
    model: string;
    serial_number: string;
    asset_number: string;
    is_smart_tv: boolean;
    created_at?: string;
    updated_at?: string;
}

const InventoryDashboardStats: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
    const stats = {
        total: items.length,
        tvs: items.filter(i => i.equipment_type && i.equipment_type.toUpperCase().includes('TELEVISOR')).length,
        neveras: items.filter(i => i.equipment_type && i.equipment_type.toUpperCase().includes('NEVERA')).length,
        otros: items.filter(i => {
            const t = (i.equipment_type || '').toUpperCase();
            return !t.includes('TELEVISOR') && !t.includes('NEVERA');
        }).length,
        smartTv: items.filter(i => i.is_smart_tv).length
    };

    const cards = [
        { label: 'Total Equipos', value: stats.total, color: '#1a237e', icon: <DevicesOtherIcon sx={{ fontSize: 40 }} /> },
        { label: 'Televisores', value: stats.tvs, color: '#2ed573', icon: <TvIcon sx={{ fontSize: 40 }} /> },
        { label: 'Neveras', value: stats.neveras, color: '#ffa502', icon: <KitchenIcon sx={{ fontSize: 40 }} /> },
        { label: 'Smart TVs', value: stats.smartTv, color: '#5352ed', icon: <TvIcon sx={{ fontSize: 40 }} /> },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {cards.map((card, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)`,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600 }}>{card.label}</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>{card.value}</Typography>
                        </Box>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1, borderRadius: '12px' }}>
                            {card.icon}
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

const InventoryCharts: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const typeData = items.reduce((acc, item) => {
        const type = item.equipment_type || 'OTRO';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(typeData).map(key => ({
        name: key,
        value: typeData[key]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const tvs = items.filter(i => i.equipment_type && i.equipment_type.toUpperCase().includes('TELEVISOR'));
    const smartCount = tvs.filter(i => i.is_smart_tv).length;
    const normalCount = tvs.length - smartCount;

    const barData = [
        { name: 'Smart TV', cantidad: smartCount },
        { name: 'TV Normal', cantidad: normalCount },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, borderRadius: '20px', height: '400px', display: 'flex', flexDirection: 'column' }} elevation={0} variant="outlined">
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#1a237e' }}>
                        Distribución por Tipo
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={!isMobile}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={isMobile ? 80 : 120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 3, borderRadius: '20px', height: '400px', display: 'flex', flexDirection: 'column' }} elevation={0} variant="outlined">
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, textAlign: 'center', color: '#1a237e' }}>
                        Tipos de Televisores
                    </Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#1a237e" name="Cantidad" radius={[10, 10, 0, 0]}>
                                {barData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#5352ed' : '#2ed573'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export const EquipmentManagement: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('equipment_inventory').select('*');
            if (!error && data) {
                setItems(data);
            }
            setLoading(false);
        };
        fetchInventory();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a237e' }}>
                    Gestión de Equipos
                </Typography>
                <Button
                    variant="contained"
                    component={Link}
                    to="/inventory"
                    startIcon={<InventoryIcon />}
                    sx={{ borderRadius: '12px', bgcolor: '#1a237e', textTransform: 'none', px: 3 }}
                >
                    Ver Detalles / Editar Inventario
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <InventoryDashboardStats items={items} />
                    <InventoryCharts items={items} />
                </>
            )}
        </Box>
    );
};
