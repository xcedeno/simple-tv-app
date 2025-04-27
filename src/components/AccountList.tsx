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
Grid,
} from '@mui/material';
import styles from './AccountList.module.css'; // Importar estilos CSS


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
interface AccountListProps {
refresh: boolean; // Prop para forzar la actualización
}

export const AccountList: React.FC<AccountListProps> = ({ refresh }) => {
const [accounts, setAccounts] = useState<Account[]>([]);
const [selectedEmail, setSelectedEmail] = useState<string>('');

// Estados para la edición
const [openModal, setOpenModal] = useState(false); // Controla el modal de edición
const [editingDevice, setEditingDevice] = useState<Device | null>(null); // Dispositivo en edición
const [editingAccountId, setEditingAccountId] = useState<string>(''); // ID de la cuenta en edición
const [editingDeviceIndex, setEditingDeviceIndex] = useState<number | null>(null); // Índice del dispositivo en edición

// Estados para la búsqueda
const [searchTerm, setSearchTerm] = useState<string>(''); // Término de búsqueda
const [searchResult, setSearchResult] = useState<{ device: Device; alias: string } | null>(null); // Resultado de la búsqueda
// Removed unused selectedAlias state
const [openSearchModal, setOpenSearchModal] = useState(false); // Controla el modal de búsqueda

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
await supabase.from('accounts').update({ devices: updatedDevices }).eq('id', accountId);
fetchAccounts(); // Actualiza los datos después de eliminar
};

// Abrir el modal para editar un dispositivo
const openEditModal = (accountId: string, device: Device, deviceIndex: number) => {
setEditingDevice(device);
setEditingAccountId(accountId);
setEditingDeviceIndex(deviceIndex);
setOpenModal(true);
};

// Cerrar el modal de edición
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

await supabase.from('accounts').update({ devices: updatedDevices }).eq('id', editingAccountId);
closeEditModal();
fetchAccounts(); // Actualiza los datos después de guardar
};

// Buscar dispositivo por número de tarjeta de acceso
const handleSearch = () => {
const foundAccount = accounts.find((acc) =>
acc.devices.some((device) => device.access_card_number === searchTerm)
);

if (foundAccount) {
const foundDevice = foundAccount.devices.find(
(device) => device.access_card_number === searchTerm
);

if (foundDevice) {
setSearchResult({ device: foundDevice, alias: foundAccount.alias });
setOpenSearchModal(true); // Abrir el modal si se encuentra el dispositivo
}
} else {
alert('No se encontró ningún dispositivo con ese número de tarjeta.');
}
};

// Cerrar el modal de búsqueda
const closeSearchModal = () => {
setSearchResult(null);
setOpenSearchModal(false);
};

// Función para verificar si la fecha de corte está vencida
const isExpired = (cutoffDate: string): boolean => {
const today = new Date();
const cutoff = new Date(cutoffDate);
return cutoff < today;
};

// Filtrar cuentas por correo electrónico
const filteredAccounts = selectedEmail
? accounts.filter((acc) => acc.email === selectedEmail)
: accounts;

return (
<Grid container spacing={3}>
    {/* Columna Principal: Tabla de Cuentas */}
    <Grid >
    <Paper style={{ padding: '16px' }}>
        <Typography variant="h5" style={{ marginBottom: '16px' }}>
        Lista de Cuentas
        </Typography>

        {/* Campo de Búsqueda */}
        <Grid>
        <TextField
            fullWidth
            label="Buscar por Número de Tarjeta"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
        />
        <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSearch}
            style={{ marginBottom: '20px' }}
        >
            Buscar
        </Button>
        </Grid>

        {/* Selector de Correo Electrónico */}
        <Select
        value={selectedEmail}
        onChange={(e) => setSelectedEmail(e.target.value)}
        displayEmpty
        fullWidth
        style={{ marginBottom: '16px' }}
        >
        <MenuItem value="">Todos</MenuItem>
        {Array.from(new Set(accounts.map((acc) => acc.email))).map((email) => (
            <MenuItem key={email} value={email}>
            {email}
            </MenuItem>
        ))}
        </Select>

        {/* Tabla de Cuentas */}
        <TableContainer component={Paper}>
        <Table>
            <TableHead>
            <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Alias</TableCell>
                <TableCell>ID Decodificador</TableCell>
                <TableCell>Número de Tarjeta</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Fecha de Corte</TableCell>
                <TableCell>Habitación</TableCell>
                <TableCell>Acciones</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {filteredAccounts.flatMap((acc) =>
                acc.devices.map((device, index) => {
                const expired = isExpired(device.cutoff_date); // Verificar si la fecha está vencida
                return (
                    <TableRow
                    key={`${acc.id}-${index}`}
                    className={expired ? styles.expiredRow : ''} // Aplicar clase si está vencida
                    >
                    <TableCell>{index === 0 ? acc.email : ''}</TableCell>
                    <TableCell>{index === 0 ? acc.alias : ''}</TableCell>
                    <TableCell>{device.decoder_id}</TableCell>
                    <TableCell>{device.access_card_number}</TableCell>
                    <TableCell>{device.balance}</TableCell>
                    <TableCell>{device.cutoff_date}</TableCell>
                    <TableCell>{device.room_number}</TableCell>
                    <TableCell>
                        <div>
                        {index === 0 && (
                            <Button
                            onClick={() => handleDeleteAccount(acc.id)}
                            color="error"
                            size="small"
                            >
                            Eliminar Cuenta
                            </Button>
                        )}
                        <Button
                            onClick={() => openEditModal(acc.id, device, index)}
                            color="primary"
                            size="small"
                        >
                            Editar
                        </Button>
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
                );
                })
            )}
            </TableBody>
        </Table>
        </TableContainer>
    </Paper>
    </Grid>

    {/* Modal para mostrar el resultado de la búsqueda */}
    <Dialog open={openSearchModal} onClose={closeSearchModal}>
    <DialogTitle>Resultado de la Búsqueda</DialogTitle>
    <DialogContent>
        {searchResult ? (
        <div>
            <Typography variant="body1">
            <strong>Alias:</strong> {searchResult.alias}
            </Typography>
            <Typography variant="body1">
            <strong>ID Decodificador:</strong> {searchResult.device.decoder_id}
            </Typography>
            <Typography variant="body1">
            <strong>Número de Tarjeta:</strong> {searchResult.device.access_card_number}
            </Typography>
            <Typography variant="body1">
            <strong>Saldo:</strong> {searchResult.device.balance}
            </Typography>
            <Typography variant="body1" style={{ color: isExpired(searchResult.device.cutoff_date) ? '#c62828' : 'inherit' }}>
            <strong>Fecha de Corte:</strong> {searchResult.device.cutoff_date}
            </Typography>
            <Typography variant="body1">
            <strong>Habitación:</strong> {searchResult.device.room_number}
            </Typography>
            {isExpired(searchResult.device.cutoff_date) && (
            <Typography variant="body2" style={{ color: '#c62828', fontWeight: 'bold' }}>
                ¡La fecha de corte está vencida!
            </Typography>
            )}
        </div>
        ) : (
        <Typography variant="body1">No se encontraron resultados.</Typography>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={closeSearchModal} color="secondary">
        Cerrar
        </Button>
    </DialogActions>
    </Dialog>

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
        label="Fecha de Corte"
        type="date"
        value={editingDevice?.cutoff_date || ''}
        onChange={(e) =>
            setEditingDevice((prev) => ({
            ...prev!,
            cutoff_date: e.target.value,
            }))
        }
        fullWidth
        margin="normal"
        InputLabelProps={{
            shrink: true,
        }}
        />
        {editingDevice && isExpired(editingDevice.cutoff_date) && (
        <Typography variant="body2" style={{ color: '#c62828', fontWeight: 'bold' }}>
            ¡La fecha de corte está vencida!
        </Typography>
        )}
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
</Grid>
);
};