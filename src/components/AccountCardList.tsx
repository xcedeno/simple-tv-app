// src/components/AccountCardList.tsx

import React from 'react';
import { Paper, Typography } from '@mui/material';
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

// Props del componente
interface AccountCardListProps {
accounts: Account[]; // Lista de cuentas
}

export const AccountCardList: React.FC<AccountCardListProps> = ({ accounts }) => {
return (
<Paper style={{ padding: '16px', marginTop: '20px' }}>
    <Typography variant="h5" style={{ marginBottom: '16px' }}>
    Tarjetas de Cuentas
    </Typography>
    {accounts.map((account) => {
    // Encontrar la fecha de corte más próxima entre todos los dispositivos
    const nearestCutoffDate = account.devices
        .map((device) => device.cutoff_date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]; // Ordenar por fecha y tomar la más cercana

    return (
        <AccountCard
        key={account.id}
        alias={account.alias}
        nearestCutoffDate={nearestCutoffDate || ''}
        />
    );
    })}
</Paper>
);
};