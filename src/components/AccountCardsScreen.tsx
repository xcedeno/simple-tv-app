// src/components/AccountCardsScreen.tsx

import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Paper, Typography, Grid } from '@mui/material';
import { AccountCard } from './AccountCard';

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

// Obtener cuentas de Supabase
useEffect(() => {
fetchAccounts();
}, []);

const fetchAccounts = async () => {
const { data } = await supabase.from('accounts').select('*');
setAccounts(data || []);
};

return (
<Paper style={{ padding: '16px', marginTop: '20px' }}>
    <Typography variant="h5" style={{ marginBottom: '16px' }}>
    Tarjetas de Cuentas
    </Typography>

    {/* Cuadrícula Responsiva */}
    <Grid container spacing={3}>
    {accounts.map((account) => {
        // Encontrar la fecha de corte más próxima entre todos los dispositivos
        const nearestCutoffDate = account.devices
        .map((device) => device.cutoff_date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]; // Ordenar por fecha y tomar la más cercana

        return (
        // Asegurarse de que el Grid tenga las propiedades correctas
        <Grid>
            {/* Componente de Tarjeta */}
            <AccountCard
            alias={account.alias}
            nearestCutoffDate={nearestCutoffDate || ''}
            />
        </Grid>
        );
    })}
    </Grid>
</Paper>
);
};