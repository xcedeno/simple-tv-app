// src/components/AccountList.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
Paper,
Typography,
Select,
MenuItem,
Button,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
TextField,
} from '@mui/material';
import styles from './AccountList.module.css'; // Importar estilos CSS

// Interfaz para un dispositivo
interface Device {
decoder_id: string;
access_card_number: string;
balance: number;
days_remaining: number;
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
interface AccountListProps {
refresh: boolean; // Prop para forzar la actualización
}

export const AccountList: React.FC<AccountListProps> = ({ refresh }) => {
const [accounts, setAccounts] = useState<Account[]>([]);
const [selectedEmail, setSelectedEmail] = useState<string>('');
const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal
const [editingDevice, setEditingDevice] = useState<Device | null>(null); // Dispositivo en edición
const [editingAccountId, setEditingAccountId] = useState<string>(''); // ID de la cuenta en edición
const [editingDeviceIndex, setEditingDeviceIndex] = useState<number | null>(null); // Índice del dispositivo en edición

// Obtener cuentas de Supabase
useEffect(() => {
fetchAccounts();
}, [refresh]);

const fetchAccounts = async () => {
const { data } = await supabase.from('accounts').select('*');
setAccounts(data || []);
};

// Eliminar una cuenta
const handleDeleteAccount = async (id: string) => {
await supabase.from('accounts').delete().eq('id', id);
fetchAccounts(); // Actualiza los datos después de eliminar
};

// Eliminar un dispositivo
const handleDeleteDevice = async (accountId: string, deviceIndex: number) => {
const account = accounts.find((acc) => acc.id === accountId);
if (!account) return;

const updatedDevices = account.devices.filter((_, index) => index !== deviceIndex);

await supabase
    .from('accounts')
    .update({ devices: updatedDevices })
    .eq('id', accountId);

fetchAccounts(); // Actualiza los datos después de eliminar
};

// Abrir el modal para editar un dispositivo
const openEditModal = (accountId: string, device: Device, deviceIndex: number) => {
setEditingDevice(device);
setEditingAccountId(accountId);
setEditingDeviceIndex(deviceIndex);
setOpenModal(true);
};

// Cerrar el modal
const closeEditModal = () => {
setEditingDevice(null);
setEditingAccountId('');
setEditingDeviceIndex(null);
setOpenModal(false);
};

// Guardar cambios en el dispositivo
const handleSaveDevice = async () => {
if (!editingDevice || !editingAccountId || editingDeviceIndex === null) return;

const account = accounts.find((acc) => acc.id === editingAccountId);
if (!account) return;

const updatedDevices = [...account.devices];
updatedDevices[editingDeviceIndex] = editingDevice;

await supabase
    .from('accounts')
    .update({ devices: updatedDevices })
    .eq('id', editingAccountId);

closeEditModal();
fetchAccounts(); // Actualiza los datos después de guardar
};

// Filtrar cuentas por correo electrónico
const filteredAccounts = selectedEmail
? accounts.filter((acc) => acc.email === selectedEmail)
: accounts;

return (
<>
    <TableContainer component={Paper} className={styles.container}>
    <Typography variant="h5" className={styles.title}>
        Lista de Cuentas
    </Typography>
    <div >
        <Select
        value={selectedEmail}
        onChange={(e) => setSelectedEmail(e.target.value)}
        displayEmpty
        fullWidth
        className={styles.select}
        >
        <MenuItem value="">Todos</MenuItem>
        {Array.from(new Set(accounts.map((acc) => acc.email))).map((email) => (
            <MenuItem key={email} value={email}>
            {email}
            </MenuItem>
        ))}
        </Select>
    </div>
    <Table className={styles.table}>
        <TableHead>
        <TableRow>
            <TableCell className={styles.cell}>Email</TableCell>
            <TableCell className={styles.cell}>Alias</TableCell>
            <TableCell className={styles.cell}>ID Decodificador</TableCell>
            <TableCell className={styles.cell}>Número de Tarjeta</TableCell>
            <TableCell className={styles.cell}>Saldo</TableCell>
            <TableCell className={styles.cell}>Días Restantes</TableCell>
            <TableCell className={styles.cell}>Habitación</TableCell>
            <TableCell className={styles.cell}>Acciones</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
        {/* Iterar sobre las cuentas y sus dispositivos */}
        {filteredAccounts.flatMap((acc) =>
            acc.devices.map((device, index) => (
            <TableRow key={`${acc.id}-${index}`}>
                {/* Mostrar el correo solo en la primera fila del dispositivo */}
                <TableCell className={styles.cell}>{index === 0 ? acc.email : ''}</TableCell>
                <TableCell className={styles.cell}>{index === 0 ? acc.alias : ''}</TableCell> {/* Mostrar alias */}
                <TableCell className={styles.cell}>{device.decoder_id}</TableCell>
                <TableCell className={styles.cell}>{device.access_card_number}</TableCell>
                <TableCell className={styles.cell}>{device.balance}</TableCell>
                <TableCell className={styles.cell}>{device.days_remaining}</TableCell>
                <TableCell className={styles.cell}>{device.room_number}</TableCell>
                <TableCell className={styles.cell}>
                <div className={styles.actions}>
                    {/* Botón para eliminar toda la cuenta */}
                    {index === 0 && (
                    <Button
                        onClick={() => handleDeleteAccount(acc.id)}
                        color="error"
                        size="small"
                    >
                        Eliminar Cuenta
                    </Button>
                    )}
                    {/* Botón para editar el dispositivo */}
                    <Button
                    onClick={() => openEditModal(acc.id, device, index)}
                    color="primary"
                    size="small"
                    >
                    Editar
                    </Button>
                    {/* Botón para eliminar el dispositivo */}
                    <Button
                    onClick={() => handleDeleteDevice(acc.id, index)}
                    color="error"
                    size="small"
                    >
                    Eliminar
                    </Button>
                </div>
                </TableCell>
            </TableRow>
            ))
        )}
        </TableBody>
    </Table>
    </TableContainer>

    {/* Modal para editar un dispositivo */}
    <Dialog open={openModal} onClose={closeEditModal}>
    <DialogTitle>Editar Dispositivo</DialogTitle>
    <DialogContent>
        <TextField
        label="ID Decodificador"
        value={editingDevice?.decoder_id || ''}
        onChange={(e) =>
            setEditingDevice((prev) => ({ ...prev!, decoder_id: e.target.value }))
        }
        fullWidth
        margin="normal"
        />
        <TextField
        label="Número de Tarjeta de Acceso"
        value={editingDevice?.access_card_number || ''}
        onChange={(e) =>
            setEditingDevice((prev) => ({
            ...prev!,
            access_card_number: e.target.value,
            }))
        }
        fullWidth
        margin="normal"
        />
        <TextField
        label="Saldo"
        type="number"
        value={editingDevice?.balance || 0}
        onChange={(e) =>
            setEditingDevice((prev) => ({
            ...prev!,
            balance: Number(e.target.value),
            }))
        }
        fullWidth
        margin="normal"
        />
        <TextField
        label="Días Restantes"
        type="number"
        value={editingDevice?.days_remaining || 0}
        onChange={(e) =>
            setEditingDevice((prev) => ({
            ...prev!,
            days_remaining: Number(e.target.value),
            }))
        }
        fullWidth
        margin="normal"
        />
        <TextField
        label="Número de Habitación"
        value={editingDevice?.room_number || ''}
        onChange={(e) =>
            setEditingDevice((prev) => ({
            ...prev!,
            room_number: e.target.value,
            }))
        }
        fullWidth
        margin="normal"
        />
    </DialogContent>
    <DialogActions>
        <Button onClick={closeEditModal} color="secondary">
        Cancelar
        </Button>
        <Button onClick={handleSaveDevice} color="primary">
        Guardar Cambios
        </Button>
    </DialogActions>
    </Dialog>
</>
);
};