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
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider
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

// Función helper para verificar si una fecha ha expirado
const isExpired = (cutoffDate: string): boolean => {
  const today = new Date();
  const cutoff = new Date(cutoffDate);
  return cutoff < today;
};

// Componente memoizado para la tabla de dispositivos
const DeviceTable = memo(({ devices, accountId, openEditModal }: {
  devices: Device[];
  accountId: string;
  openEditModal: (accountId: string, device: Device, index: number) => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return (
      <Box sx={{ mt: 1 }}>
        {devices.map((device, index) => (
          <Card key={`${device.decoder_id}-${index}`} variant="outlined" sx={{ mb: 2, borderRadius: '12px' }}>
            <CardContent>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" color="textSecondary">ID Decodificador</Typography>
                  <Typography variant="body1" fontWeight="bold">{device.decoder_id}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">Tarjeta</Typography>
                  <Typography variant="body2">{device.access_card_number}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">Saldo</Typography>
                  <Typography variant="body2">${device.balance}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">Fecha Corte</Typography>
                  <Typography variant="body2" style={{ color: isExpired(device.cutoff_date) ? 'red' : 'inherit' }}>
                    {device.cutoff_date}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="textSecondary">Habitación</Typography>
                  <Typography variant="body2">{device.room_number}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => openEditModal(accountId, device, index)}
                  >
                    Editar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  return (
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
              <TableCell style={{ color: isExpired(device.cutoff_date) ? 'red' : 'inherit' }}>
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
  );
});

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
}) => {
  return (
    <Accordion
      expanded={expandedAccounts.has(account.id)}
      onChange={handleAccordionChange(account.id)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography
            noWrap
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '0.75rem', sm: '1rem' },
              maxWidth: { xs: '60%', sm: 'auto' }
            }}
          >
            {account.email}
          </Typography>
          <Typography
            noWrap
            color="textSecondary"
            sx={{
              ml: 1,
              fontSize: { xs: '0.75rem', sm: '1rem' },
              maxWidth: { xs: '35%', sm: 'auto' },
              textAlign: 'right'
            }}
          >
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
  );
});

const AccountList = ({ refresh }: AccountListProps) => {
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
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={!searchTerm}
              >
                Buscar
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Select
                fullWidth
                displayEmpty
                value={selectedEmail}
                onChange={handleEmailSelectChange}
                renderValue={(selected) => {
                  if (!selected) {
                    return <em>Buscar por Correo</em>;
                  }
                  return selected;
                }}
              >
                <MenuItem disabled value="">
                  <em>Seleccione un correo</em>
                </MenuItem>
                {sortedAccounts(accounts).map((account) => (
                  <MenuItem key={account.id} value={account.email}>
                    {account.email}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>

          <Box>
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

      {/* Modal de Edición */}
      <Dialog open={openModal} onClose={closeEditModal}>
        <DialogTitle>Editar Dispositivo</DialogTitle>
        <DialogContent>
          {editingDevice && (
            <>
              <TextField
                margin="dense"
                label="ID Decodificador"
                fullWidth
                value={editingDevice.decoder_id}
                onChange={(e) => setEditingDevice({ ...editingDevice, decoder_id: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Tarjeta de Acceso"
                fullWidth
                value={editingDevice.access_card_number}
                onChange={(e) => setEditingDevice({ ...editingDevice, access_card_number: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Saldo"
                type="number"
                fullWidth
                value={editingDevice.balance}
                onChange={(e) => setEditingDevice({ ...editingDevice, balance: parseFloat(e.target.value) })}
              />
              <TextField
                margin="dense"
                label="Fecha de Corte"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editingDevice.cutoff_date}
                onChange={(e) => setEditingDevice({ ...editingDevice, cutoff_date: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Habitación"
                fullWidth
                value={editingDevice.room_number}
                onChange={(e) => setEditingDevice({ ...editingDevice, room_number: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveDevice} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Búsqueda */}
      <Dialog open={openSearchModal} onClose={closeSearchModal}>
        <DialogTitle>Resultado de Búsqueda</DialogTitle>
        <DialogContent>
          {searchResult && (
            <Box>
              <Typography variant="subtitle1"><strong>Alias:</strong> {searchResult.alias}</Typography>
              <Typography variant="subtitle1"><strong>ID Decodificador:</strong> {searchResult.device.decoder_id}</Typography>
              <Typography variant="subtitle1"><strong>Tarjeta:</strong> {searchResult.device.access_card_number}</Typography>
              <Typography variant="subtitle1"><strong>Saldo:</strong> ${searchResult.device.balance}</Typography>
              <Typography variant="subtitle1" style={{ color: isExpired(searchResult.device.cutoff_date) ? 'red' : 'inherit' }}>
                <strong>Fecha Corte:</strong> {searchResult.device.cutoff_date}
              </Typography>
              <Typography variant="subtitle1"><strong>Habitación:</strong> {searchResult.device.room_number}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSearchModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default AccountList;