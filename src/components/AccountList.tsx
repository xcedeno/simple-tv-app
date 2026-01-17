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
  useTheme,
} from '@mui/material';

// IMPORTANTE: Importación correcta para MUI v6/v7 (Grid V2)
import Grid from '@mui/material/Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- Interfaces ---
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

// --- Helpers ---
const calculateBalanceFromCutoff = (cutoffDate: string): number => {
  const serviceDayValue = 0.8;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const cutoff = new Date(cutoffDate);
  cutoff.setUTCHours(0, 0, 0, 0);

  if (cutoff < today) {
    return 0;
  }

  const diffTime = cutoff.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const balance = diffDays * serviceDayValue;
  return balance;
};

// --- Subcomponentes Memoizados ---
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
            <TableCell>${calculateBalanceFromCutoff(device.cutoff_date).toFixed(2)}</TableCell>
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

// --- Componente Principal ---
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
  const theme = useTheme();

  // Funciones de carga y lógica
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

    const currentAccount = accounts.find(acc => acc.id === editingAccountId);
    if (currentAccount && editingDevice) {
      const newCutoffDate = editingDevice.cutoff_date;
      const sameEmailAccounts = accounts.filter(acc => acc.email === currentAccount.email);

      const updates = sameEmailAccounts.map(async (acc) => {
        const updatedAccDevices = acc.devices.map(d => ({
          ...d,
          cutoff_date: newCutoffDate
        }));

        await supabase
          .from('accounts')
          .update({ devices: updatedAccDevices })
          .eq('id', acc.id);

        return { ...acc, devices: updatedAccDevices };
      });

      await Promise.all(updates);

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

  const sortedAccounts = useCallback((accountsToSort: Account[]): Account[] => {
    return [...accountsToSort].sort((a, b) => a.email.localeCompare(b.email));
  }, []);

  // --- RENDERIZADO CORREGIDO (Grid V2 + Fix Overload) ---
  return (
    <Box sx={{ width: '100%', p: 2 }}>

      <Paper style={{ padding: '16px' }}>
        <Typography variant="h5" style={{ marginBottom: '16px' }}>
          Lista de Cuentas
        </Typography>

        {/* Grid Container (V2) */}
        <Grid container spacing={2} alignItems="center" style={{ marginBottom: '20px' }}>

          {/* Input de Búsqueda */}
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
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                  '&:hover fieldset': { borderColor: theme.palette.primary.main },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                  '& fieldset': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)' },
                },
              }}
            />
          </Grid>

          {/* Botón Buscar */}
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

          {/* Select de Email */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Select
              value={selectedEmail}
              onChange={handleEmailSelectChange}
              displayEmpty
              fullWidth
              size="small"
              sx={{
                borderRadius: '12px',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                '&:hover': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : '#e0e0e0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
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

        {/* Lista Scrollable */}
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

      {/* --- MODALES --- */}

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
                <strong>Saldo:</strong> ${calculateBalanceFromCutoff(searchResult.device.cutoff_date).toFixed(2)}
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
            label="Saldo (calculado)"
            type="number"
            value={editingDevice ? calculateBalanceFromCutoff(editingDevice.cutoff_date).toFixed(2) : 0}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
            helperText="El saldo se calcula en base a la fecha de corte."
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
    </Box>
  );
};