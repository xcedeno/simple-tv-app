import React, { useState, useEffect, useCallback, memo, SyntheticEvent } from 'react';
import { supabase } from '../supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Device {
  decoder_id: string;
  access_card_number: string;
  balance: number;
  cutoff_date: string;
  room_number: string;
}

interface Account {
  id: string;
  email: string;
  alias: string;
  devices: Device[];
}

interface AccountListProps {
  refresh: boolean;
}

// Componente memoizado para la tabla de dispositivos
const DeviceTable = memo(({ devices, accountId, openEditModal }: {
  devices: Device[];
  accountId: string;
  openEditModal: (accountId: string, device: Device, index: number) => void;
}) => (
  <TableContainer component={Paper} variant="outlined" style={{ marginTop: '10px' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><strong>ID Decodificador</strong></TableCell>
          <TableCell><strong>Tarjeta</strong></TableCell>
          <TableCell><strong>Saldo</strong></TableCell>
          <TableCell><strong>Fecha Corte</strong></TableCell>
          <TableCell><strong>Habitación</strong></TableCell>
          <TableCell><strong>Acciones</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {devices.map((device, index) => (
          <TableRow key={`${device.decoder_id}-${index}`}>
            <TableCell>{device.decoder_id}</TableCell>
            <TableCell>{device.access_card_number}</TableCell>
            <TableCell>${device.balance}</TableCell>
            <TableCell style={{ color: new Date(device.cutoff_date) < new Date() ? 'red' : 'inherit' }}>
              {device.cutoff_date}
            </TableCell>
            <TableCell>{device.room_number}</TableCell>
            <TableCell>
              <Button
                variant="outlined"
                size="small"
                onClick={() => openEditModal(accountId, device, index)}
              >
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));

// Componente memoizado para cada acordeón
const AccountAccordion = memo(({
  account,
  expandedAccounts,
  handleAccordionChange,
  openEditModal
}: {
  account: Account;
  expandedAccounts: Set<string>;
  handleAccordionChange: (accountId: string) => (event: SyntheticEvent, isExpanded: boolean) => void;
  openEditModal: (accountId: string, device: Device, index: number) => void;
}) => (
  <Accordion
    expanded={expandedAccounts.has(account.id)}
    onChange={handleAccordionChange(account.id)}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Typography noWrap>{account.email}</Typography>
        <Typography noWrap color="textSecondary" sx={{ ml: 2 }}>
          {account.alias}
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <DeviceTable
        devices={account.devices}
        accountId={account.id}
        openEditModal={openEditModal}
      />
    </AccordionDetails>
  </Accordion>
));

export const AccountList: React.FC<AccountListProps> = ({ refresh }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [openModal, setOpenModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editingAccountId, setEditingAccountId] = useState<string>('');
  const [editingDeviceIndex, setEditingDeviceIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{ device: Device; alias: string } | null>(null);
  const [openSearchModal, setOpenSearchModal] = useState(false);

  // Función para obtener cuentas
  const fetchAccounts = useCallback(async () => {
    const { data, error } = await supabase.from('accounts').select('*');
    if (error) {
      console.error('Error fetching accounts:', error);
      return;
    }
    setAccounts(data || []);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [refresh, fetchAccounts]);

  // Handlers optimizados con useCallback
  const handleAccordionChange = useCallback((accountId: string) =>
    (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccounts(prev => {
        const newSet = new Set(prev);
        if (isExpanded) {
          newSet.add(accountId);
        } else {
          newSet.delete(accountId);
        }
        return newSet;
      });
    }, []);

  const handleEmailSelectChange = useCallback((e: SelectChangeEvent<string>) => {
    const email = e.target.value;
    setSelectedEmail(email);

    if (email) {
      const account = accounts.find(acc => acc.email === email);
      if (account) {
        setExpandedAccounts(prev => new Set(prev).add(account.id));
      }
    }
  }, [accounts]);

  const openEditModal = useCallback((accountId: string, device: Device, deviceIndex: number) => {
    setEditingDevice(device);
    setEditingAccountId(accountId);
    setEditingDeviceIndex(deviceIndex);
    setOpenModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingDevice(null);
    setEditingAccountId('');
    setEditingDeviceIndex(null);
    setOpenModal(false);
  }, []);

  const handleSaveDevice = useCallback(async () => {
    if (!editingDevice || !editingAccountId || editingDeviceIndex === null) return;
    const account = accounts.find((acc) => acc.id === editingAccountId);
    if (!account) return;

    // Sincronizar fecha de corte con otras cuentas del mismo email
    const currentAccount = accounts.find(acc => acc.id === editingAccountId);
    if (currentAccount && editingDevice) {
      const newCutoffDate = editingDevice.cutoff_date;

      // Encontrar todas las cuentas con el mismo email
      const sameEmailAccounts = accounts.filter(acc => acc.email === currentAccount.email);

      // Actualizar estado local y base de datos para todas las cuentas afectadas
      const updates = sameEmailAccounts.map(async (acc) => {
        const updatedAccDevices = acc.devices.map(d => ({
          ...d,
          cutoff_date: newCutoffDate
        }));

        // Actualizar DB
        await supabase
          .from('accounts')
          .update({ devices: updatedAccDevices })
          .eq('id', acc.id);

        return { ...acc, devices: updatedAccDevices };
      });

      await Promise.all(updates);

      // Actualizar el estado local globalmente
      const updatedAccountsList = accounts.map(acc => {
        if (acc.email === currentAccount.email) {
          return {
            ...acc,
            devices: acc.devices.map(d => ({
              ...d,
              cutoff_date: newCutoffDate
            }))
          };
        }
        return acc;
      });

      setAccounts(updatedAccountsList);
    } else {
      fetchAccounts();
    }

    closeEditModal();
  }, [editingDevice, editingAccountId, editingDeviceIndex, accounts, fetchAccounts, closeEditModal]);

  const handleSearch = useCallback(() => {
    const foundAccount = accounts.find(acc =>
      acc.devices.some(device => device.access_card_number === searchTerm)
    );

    if (foundAccount) {
      const foundDevice = foundAccount.devices.find(
        device => device.access_card_number === searchTerm
      );
      if (foundDevice) {
        setSearchResult({ device: foundDevice, alias: foundAccount.alias });
        setOpenSearchModal(true);
      }
    } else {
      alert('No se encontró ningún dispositivo con ese número de tarjeta.');
    }
  }, [accounts, searchTerm]);

  const closeSearchModal = useCallback(() => {
    setSearchResult(null);
    setOpenSearchModal(false);
  }, []);

  const isExpired = useCallback((cutoffDate: string): boolean => {
    const today = new Date();
    const cutoff = new Date(cutoffDate);
    return cutoff < today;
  }, []);

  // Ordenar cuentas por email
  const sortedAccounts = useCallback((accountsToSort: Account[]): Account[] => {
    return [...accountsToSort].sort((a, b) => a.email.localeCompare(b.email));
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Paper style={{ padding: '16px' }}>
          <Typography variant="h5" style={{ marginBottom: '16px' }}>
            Lista de Cuentas
          </Typography>

          <Grid container spacing={2} alignItems="center" style={{ marginBottom: '20px' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                label="Buscar por Número de Tarjeta"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f5f5f5',
                    '&:hover fieldset': {
                      borderColor: '#3f51b5',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3f51b5',
                    },
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearch}
                size="medium"
                style={{ height: '40px', borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
              >
                Buscar
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Select
                value={selectedEmail}
                onChange={handleEmailSelectChange}
                displayEmpty
                fullWidth
                size="small"
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3f51b5',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3f51b5',
                  },
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    Todos los correos
                  </Typography>
                </MenuItem>
                {Array.from(new Set(accounts.map(acc => acc.email))).map((email) => (
                  <MenuItem key={email} value={email}>
                    {email}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          {/* Lista de acordeones optimizada con scroll */}
          <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            {sortedAccounts(accounts).map((account) => (
              <AccountAccordion
                key={account.id}
                account={account}
                expandedAccounts={expandedAccounts}
                handleAccordionChange={handleAccordionChange}
                openEditModal={openEditModal}
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Modal de búsqueda */}
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

      {/* Modal de edición */}
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
            onChange={(e) => {
              const newCutoffDate = e.target.value;
              setEditingDevice((prev) => ({
                ...prev!,
                cutoff_date: newCutoffDate,
              }));
            }}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography variant="body2" color="textSecondary" style={{ marginTop: '8px' }}>
            Al cambiar esta fecha, también se aplicará a otros dispositivos asociados al correo{' '}
            <strong>{accounts.find(acc => acc.id === editingAccountId)?.email}</strong>.
          </Typography>
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