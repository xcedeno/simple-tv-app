import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Paper, Typography, Grid, Button } from '@mui/material';
import { AccountCard } from './AccountCard';
import { CheckRequestModal } from './CheckRequestModal';

// Interfaz para un dispositivo
interface Device {
    decoder_id: string;
    access_card_number: string;
    balance: number;
    cutoff_date: string; // Fecha de corte en formato ISO (YYYY-MM-DD)
    room_number: string;
}

// Interfaz para una cuenta
interface Account {
    id: string;
    email: string;
    alias: string;
    devices: Device[];
}

export const AccountCardsScreen = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [checkRequestOpen, setCheckRequestOpen] = useState(false);

    // Obtener cuentas de Supabase
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        const { data } = await supabase.from('accounts').select('*');
        setAccounts(data || []);
    };

    return (
        <Paper style={{ padding: '16px', marginTop: '20px', backgroundColor: 'transparent', boxShadow: 'none' }}>
            {/* Título y Botón "Generar Solicitud" */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>
                    Tarjetas de Cuentas
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setCheckRequestOpen(true)}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
                    }}
                >
                    Generar Solicitud
                </Button>
            </div>

            {/* Cuadrícula Responsiva */}
            <Grid container spacing={3}>
                {accounts.map((account) => {
                    // Encontrar la fecha de corte más próxima entre todos los dispositivos
                    const nearestCutoffDate = account.devices
                        .map((device) => device.cutoff_date)
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]; // Ordenar por fecha y tomar la más cercana

                    return (
                        // Asegurarse de que el Grid tenga las propiedades correctas
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={account.id}>
                            {/* Componente de Tarjeta */}
                            <AccountCard
                                alias={account.alias}
                                email={account.email}
                                nearestCutoffDate={nearestCutoffDate || ''}
                                roomNumbers={account.devices.map(device => device.room_number)}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            <CheckRequestModal
                open={checkRequestOpen}
                onClose={() => setCheckRequestOpen(false)}
                accounts={accounts}
            />
        </Paper>
    );
};