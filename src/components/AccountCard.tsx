// src/components/AccountCard.tsx

import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import dayjs from 'dayjs';

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

// Determinar el color de la tarjeta
const getCardColor = (daysRemaining: number): string => {
if (daysRemaining < 0) return '#ffebee'; // Rojo claro (vencido)
if (daysRemaining <= 5) return '#fff8e1'; // Amarillo claro (próximo a vencer)
return '#e8f5e9'; // Verde claro (más de 5 días)
};

// Obtener los días restantes
const daysRemaining = getDaysRemaining(nearestCutoffDate);

// Determinar el color de la tarjeta
const cardColor = getCardColor(daysRemaining);

return (
<Card style={{ backgroundColor: cardColor, height: '100%' }}>
    <CardContent style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
        Alias: {alias}
        </Typography>
        <Typography variant="body1">
        Fecha de Corte Más Próxima: {nearestCutoffDate}
        </Typography >
        {/* Mostrar los números de habitación */}
        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
        Habitaciones: {roomNumbers.length > 0 ? roomNumbers.join(', ') : 'Sin habitaciones'}
        </Typography>
    </div>
    <Typography variant="body2" style={{ marginTop: '8px', textAlign: 'center' }}>
        {daysRemaining < 0
        ? '¡Vencido!'
        : daysRemaining === 0
        ? '¡Hoy es la fecha de corte!'
        : daysRemaining === 1
        ? 'Queda 1 día'
        : `Quedan ${daysRemaining} días`}
    </Typography>
    </CardContent>
</Card>
);
};