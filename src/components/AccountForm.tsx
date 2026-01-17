
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
    Box,
    Divider,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import { AddCircle, RemoveCircle, Save, Devices } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs from 'dayjs';

// Definición de tipos actualizada
interface Device {
    decoder_id: string;
    access_card_number: string;
    balance: number;
    cutoff_date: string; // Fecha de corte en formato ISO (YYYY-MM-DD)
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
        devices: account?.devices || [
            { decoder_id: '', access_card_number: '', balance: 0, cutoff_date: '', room_number: '' },
        ],
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
        value: string | number | Date
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
                { decoder_id: '', access_card_number: '', balance: 0, cutoff_date: '', room_number: '' },
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
            devices: [{ decoder_id: '', access_card_number: '', balance: 0, cutoff_date: '', room_number: '' }],
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

    const theme = useTheme();

    // ... (rest of the component logic remains same) ...

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper
                elevation={0}
                sx={{
                    maxWidth: '95%',
                    margin: '40px auto',
                    padding: { xs: 3, md: 5 },
                    borderRadius: '24px',
                    boxShadow: theme.palette.mode === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.08)',
                    backgroundColor: theme.palette.background.paper, // Dynamic background
                }}
            >
                <Box mb={4} textAlign="center">
                    <Typography variant="overline" color="primary" sx={{ letterSpacing: 2, fontWeight: 700 }}>
                        GESTIÓN DE CUENTAS
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.mode === 'dark' ? 'white' : '#1a237e', mt: 1 }}>
                        {account?.email ? 'Editar Cuenta' : 'Nueva Cuenta'}
                    </Typography>
                </Box>

                {/* Mostrar mensaje de error de conexión */}
                {connectionError && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                        Error de conexión: {connectionError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Sección de Información de la Cuenta */}
                        <Grid size={{ xs: 12 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    borderRadius: '16px',
                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fafafa'
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
                                    <Box component="span" sx={{ width: 4, height: 24, bgcolor: 'primary.main', mr: 2, borderRadius: 1 }} />
                                    Información General
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Correo Electrónico"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleEmailChange}
                                            required
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#fff'
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Alias"
                                            value={formData.alias}
                                            onChange={handleAliasChange}
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '12px',
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#fff'
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Sección de Dispositivos */}
                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" alignItems="center" mb={2} mt={2}>
                                <Devices sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    Dispositivos Asociados
                                </Typography>
                                <Chip
                                    label={formData.devices.length}
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 2, fontWeight: 700, borderRadius: '8px' }}
                                />
                            </Box>

                            {formData.devices.map((device, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        mb: 3,
                                        borderRadius: '16px',
                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                                        border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                                        boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 12px rgba(0,0,0,0.03)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,0,0,0.06)',
                                            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'
                                        }
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                                            Dispositivo #{index + 1}
                                        </Typography>
                                        <IconButton onClick={() => removeDevice(index)} color="error" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}>
                                            <RemoveCircle fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="ID del Decodificador"
                                                value={device.decoder_id}
                                                onChange={(e) => handleDeviceChange(index, 'decoder_id', e.target.value)}
                                                required
                                                size="small"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'inherit' } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Tarjeta de Acceso"
                                                value={device.access_card_number}
                                                onChange={(e) => handleDeviceChange(index, 'access_card_number', e.target.value)}
                                                required
                                                size="small"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'inherit' } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Saldo"
                                                type="number"
                                                value={device.balance}
                                                onChange={(e) => handleDeviceChange(index, 'balance', Number(e.target.value))}
                                                size="small"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'inherit' } }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <DatePicker
                                                label="Fecha de Corte"
                                                value={device.cutoff_date ? dayjs(device.cutoff_date) : null}
                                                onChange={(date: dayjs.Dayjs | null) => {
                                                    handleDeviceChange(
                                                        index,
                                                        'cutoff_date',
                                                        date?.format('YYYY-MM-DD') || ''
                                                    );
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: 'small',
                                                        sx: { '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'inherit' } }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Habitación"
                                                value={device.room_number}
                                                onChange={(e) => handleDeviceChange(index, 'room_number', e.target.value)}
                                                size="small"
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'inherit' } }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<AddCircle />}
                                onClick={addDevice}
                                sx={{
                                    borderRadius: '12px',
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    py: 2,
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderWidth: 2,
                                        backgroundColor: theme.palette.action.hover
                                    }
                                }}
                            >
                                Agregar Otro Dispositivo
                            </Button>
                        </Grid>

                        {/* Botones de Envío */}
                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 3 }} />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                sx={{
                                    py: 2,
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    boxShadow: '0 8px 20px rgba(26, 35, 126, 0.2)',
                                    background: theme.palette.primary.main, // Use theme primary
                                    '&:hover': {
                                        boxShadow: '0 12px 24px rgba(26, 35, 126, 0.3)',
                                        background: theme.palette.primary.dark,
                                    }
                                }}
                            >
                                {account?.email ? 'Actualizar Cuenta' : 'Guardar Cuenta'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </LocalizationProvider>
    );
};
