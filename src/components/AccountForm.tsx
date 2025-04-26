// src/components/AccountForm.tsx

import React, { useState } from 'react';
import { supabase, checkSupabaseConnection } from '../supabaseClient';
import {
TextField,
Button,
Grid,
Paper,
Typography,
IconButton,
Alert,
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import styles from './AccountForm.module.css'; // Importar los estilos

// Definición de tipos actualizada
interface Device {
decoder_id: string;
access_card_number: string;
balance: number;
days_remaining: number;
room_number: string;
}

interface Account {
email: string;
alias: string;
devices: Device[];
}

interface Props {
account?: Account;
onSaved: () => void;
}

export const AccountForm: React.FC<Props> = ({ account, onSaved }) => {
const [formData, setFormData] = useState<Account>({
email: account?.email || '',
alias: account?.alias || '',
devices: account?.devices || [{ decoder_id: '', access_card_number: '', balance: 0, days_remaining: 0, room_number: '' }],
});
const [connectionError, setConnectionError] = useState<string | null>(null);

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setFormData((prev) => ({ ...prev, email: e.target.value }));
};

const handleAliasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setFormData((prev) => ({ ...prev, alias: e.target.value }));
};

const handleDeviceChange = (
index: number,
field: keyof Device,
value: string | number
) => {
setFormData((prev) => {
    const updatedDevices = [...prev.devices];
    updatedDevices[index] = { ...updatedDevices[index], [field]: value };
    return { ...prev, devices: updatedDevices };
});
};

const addDevice = () => {
setFormData((prev) => ({
    ...prev,
    devices: [
    ...prev.devices,
    { decoder_id: '', access_card_number: '', balance: 0, days_remaining: 0, room_number: '' },
    ],
}));
};

const removeDevice = (index: number) => {
setFormData((prev) => {
    const updatedDevices = prev.devices.filter((_, i) => i !== index);
    return { ...prev, devices: updatedDevices };
});
};

const resetForm = () => {
setFormData({
    email: '',
    alias: '',
    devices: [{ decoder_id: '', access_card_number: '', balance: 0, days_remaining: 0, room_number: '' }],
});
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

// Verificar la conexión antes de enviar los datos
const connectionStatus = await checkSupabaseConnection();
if (!connectionStatus.connected) {
    setConnectionError(connectionStatus.message);
    return;
}

try {
    const { data: existingAccount, error: fetchError } = await supabase
    .from('accounts')
    .select('devices')
    .eq('email', formData.email)
    .maybeSingle();

    if (fetchError && fetchError.message !== 'No rows found') {
    console.error('Error al verificar el email:', fetchError.message);
    return;
    }

    let updatedDevices: Device[] = [];

    if (existingAccount) {
    updatedDevices = [
        ...((existingAccount.devices || []) as Device[]),
        ...formData.devices.filter(
        (newDevice: Device) =>
            !(existingAccount.devices as Device[]).some(
            (existingDevice: Device) => existingDevice.decoder_id === newDevice.decoder_id
            )
        ),
    ];

    await supabase
        .from('accounts')
        .update({ devices: updatedDevices, alias: formData.alias })
        .eq('email', formData.email);
    } else {
    await supabase.from('accounts').insert([formData]);
    }

    onSaved();
    resetForm();
} catch (error) {
    console.error('Error al guardar los datos:', error);
}
};

return (
<Paper className={styles.container}>
    <Typography variant="h5" className={styles.title}>
    {account?.email ? 'Editar Cuenta' : 'Crear Cuenta'}
    </Typography>

    {/* Mostrar mensaje de error de conexión */}
    {connectionError && (
    <Alert severity="error" className={styles.formField}>
        Error de conexión: {connectionError}
    </Alert>
    )}

    <form onSubmit={handleSubmit}>
    {/* Campo de Correo Electrónico */}
    <TextField
        fullWidth
        label="Correo Electrónico"
        type="email"
        value={formData.email}
        onChange={handleEmailChange}
        required
        className={styles.formField}
    />

    {/* Campo de Alias */}
    <TextField
        fullWidth
        label="Alias"
        value={formData.alias}
        onChange={handleAliasChange}
        className={styles.formField}
    />

    {/* Campos Dinámicos para Dispositivos */}
    {formData.devices.map((device, index) => (
        <Paper key={index} className={styles.deviceSection}>
        <Typography variant="subtitle1" className={styles.deviceTitle}>
            Dispositivo {index + 1}
        </Typography>
        <Grid container spacing={2}>
            <Grid>
            <TextField
                fullWidth
                label="ID del Decodificador"
                value={device.decoder_id}
                onChange={(e) => handleDeviceChange(index, 'decoder_id', e.target.value)}
                required
            />
            </Grid>
            <Grid>
            <TextField
                fullWidth
                label="Número de Tarjeta de Acceso"
                value={device.access_card_number}
                onChange={(e) => handleDeviceChange(index, 'access_card_number', e.target.value)}
                required
            />
            </Grid>
            <Grid>
            <TextField
                fullWidth
                label="Saldo"
                type="number"
                value={device.balance}
                onChange={(e) => handleDeviceChange(index, 'balance', Number(e.target.value))}
            />
            </Grid>
            <Grid>
            <TextField
                fullWidth
                label="Días Restantes"
                type="number"
                value={device.days_remaining}
                onChange={(e) => handleDeviceChange(index, 'days_remaining', Number(e.target.value))}
            />
            </Grid>
            <Grid>
            <TextField
                fullWidth
                label="Número de Habitación"
                value={device.room_number}
                onChange={(e) => handleDeviceChange(index, 'room_number', e.target.value)}
            />
            </Grid>
        </Grid>
        <IconButton onClick={() => removeDevice(index)} color="error">
            <RemoveCircle />
        </IconButton>
        </Paper>
    ))}

    {/* Botón para Agregar un Nuevo Dispositivo */}
    <Button
        fullWidth
        variant="outlined"
        startIcon={<AddCircle />}
        onClick={addDevice}
        className={styles.formField}
    >
        Agregar Dispositivo
    </Button>

    {/* Botones de Envío */}
    <div className={styles.buttonContainer}>
        <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        >
        {account?.email ? 'Actualizar' : 'Guardar'}
        </Button>
    </div>
    </form>
</Paper>
);
};