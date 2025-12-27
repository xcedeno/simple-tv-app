import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Tabs, Tab, CircularProgress, Alert, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, InputAdornment, TablePagination,
    Button, Chip, FormControlLabel, Checkbox, MenuItem, Stack, Grid,
    Card, CardActionArea,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TvIcon from '@mui/icons-material/Tv';
import KitchenIcon from '@mui/icons-material/Kitchen';
import WifiIcon from '@mui/icons-material/Wifi';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsRemoteIcon from '@mui/icons-material/SettingsRemote';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

// --- Interfaces ---
interface InventoryItem {
    id?: string;
    item_number: number;
    equipment_type: string;
    room_number: string;
    model: string;
    serial_number: string;
    asset_number: string;
    is_smart_tv: boolean;
    created_at?: string;
    updated_at?: string;
}

// Helper para generar UUIDs (Supabase los requiere si no hay default en la DB)
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// --- Subcomponent: InventoryDashboard ---
const InventoryDashboard: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
    const stats = {
        total: items.length,
        tvs: items.filter(i => i.equipment_type === 'TELEVISOR').length,
        neveras: items.filter(i => i.equipment_type === 'NEVERA').length,
        otros: items.filter(i => !['TELEVISOR', 'NEVERA'].includes(i.equipment_type)).length,
        smartTv: items.filter(i => i.is_smart_tv).length
    };

    const dashboardCards = [
        { label: 'Total Equipos', value: stats.total, color: '#1a237e', icon: <DevicesOtherIcon sx={{ fontSize: 40 }} /> },
        { label: 'Televisores', value: stats.tvs, color: '#2ed573', icon: <TvIcon sx={{ fontSize: 40 }} /> },
        { label: 'Neveras', value: stats.neveras, color: '#ffa502', icon: <KitchenIcon sx={{ fontSize: 40 }} /> },
        { label: 'Smart TVs', value: stats.smartTv, color: '#5352ed', icon: <TvIcon sx={{ fontSize: 40 }} /> },
    ];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {dashboardCards.map((card, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: '20px',
                            background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)`,
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}
                    >
                        <Box>
                            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600 }}>{card.label}</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>{card.value}</Typography>
                        </Box>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1, borderRadius: '12px' }}>
                            {card.icon}
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

// --- Subcomponent: InventoryTable ---
const InventoryTableDisplay: React.FC<{ items: InventoryItem[], onUpdate: () => void }> = ({ items, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [saving, setSaving] = useState(false);

    const equipmentTypes = ['TELEVISOR', 'NEVERA', 'WIFI', 'TELEFONO', 'DECODIFICADOR', 'OTRO'];

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.equipment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.serial_number && item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = !typeFilter || item.equipment_type === typeFilter;

        return matchesSearch && matchesType;
    });

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem({ ...item });
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (item: InventoryItem) => {
        setSelectedItem(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedItem?.id) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('equipment_inventory')
                .delete()
                .eq('id', selectedItem.id);

            if (error) throw error;
            onUpdate();
            setDeleteDialogOpen(false);
            setSelectedItem(null);
        } catch (err) {
            console.error('Error deleting:', err);
            alert('Error al eliminar');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedItem) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('equipment_inventory')
                .upsert({
                    ...selectedItem,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            onUpdate();
            setEditDialogOpen(false);
            setSelectedItem(null);
        } catch (err) {
            console.error('Error updating:', err);
            alert('Error al actualizar');
        } finally {
            setSaving(false);
        }
    };

    const getEquipmentIcon = (type: string, size: 'small' | 'large' = 'small') => {
        const t = type.toLowerCase();
        const iconProps = {
            fontSize: size === 'large' ? ('large' as any) : ('small' as any),
            color: size === 'large' ? 'primary' : ('inherit' as any)
        };

        if (t.includes('televisor') || t.includes('tv')) return <TvIcon {...iconProps} />;
        if (t.includes('nevera')) return <KitchenIcon {...iconProps} color={size === 'large' ? 'secondary' : 'inherit'} />;
        if (t.includes('wifi')) return <WifiIcon {...iconProps} color={size === 'large' ? 'info' : 'inherit'} />;
        if (t.includes('telefono')) return <PhoneIcon {...iconProps} color={size === 'large' ? 'success' : 'inherit'} />;
        if (t.includes('decodificador')) return <SettingsRemoteIcon {...iconProps} color={size === 'large' ? 'warning' : 'inherit'} />;
        return <DevicesOtherIcon {...iconProps} />;
    };

    return (
        <Box>
            <InventoryDashboard items={items} />

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#1a237e' }}>Explorar por Categoría</Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                    <Card
                        onClick={() => setTypeFilter(null)}
                        sx={{
                            borderRadius: '16px',
                            cursor: 'pointer',
                            bgcolor: typeFilter === null ? '#1a237e' : 'white',
                            color: typeFilter === null ? 'white' : 'inherit',
                            transition: 'all 0.3s ease',
                            border: '1px solid #1a237e',
                            '&:hover': { transform: 'scale(1.05)', boxShadow: 4 }
                        }}
                    >
                        <CardActionArea sx={{ p: 2, textAlign: 'center' }}>
                            <DevicesOtherIcon fontSize="large" sx={{ mb: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>TODOS</Typography>
                        </CardActionArea>
                    </Card>
                </Grid>
                {equipmentTypes.map(type => (
                    <Grid size={{ xs: 6, sm: 4, md: 2 }} key={type}>
                        <Card
                            onClick={() => setTypeFilter(type)}
                            sx={{
                                borderRadius: '16px',
                                cursor: 'pointer',
                                bgcolor: typeFilter === type ? '#1a237e' : 'white',
                                color: typeFilter === type ? 'white' : 'inherit',
                                transition: 'all 0.3s ease',
                                border: '1px solid #e0e0e0',
                                '&:hover': { transform: 'scale(1.05)', boxShadow: 4 }
                            }}
                        >
                            <CardActionArea sx={{ p: 2, textAlign: 'center' }}>
                                {getEquipmentIcon(type, 'large')}
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>{type}</Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        placeholder="Buscar por habitación, modelo o serial..."
                        variant="outlined" size="small" value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: { xs: '100%', md: 400 }, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                            ),
                        }}
                    />
                    {typeFilter && (
                        <Chip
                            label={`Filtrado por: ${typeFilter}`}
                            onDelete={() => setTypeFilter(null)}
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Box>
                <Typography variant="body2" color="textSecondary">Resultados: {filteredItems.length} equipos</Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#f1f3f4' }}>
                        <TableRow>
                            <TableCell><strong>ITEM</strong></TableCell>
                            <TableCell><strong>HABITACIÓN</strong></TableCell>
                            <TableCell><strong>TIPO</strong></TableCell>
                            <TableCell><strong>MODELO</strong></TableCell>
                            <TableCell><strong>SERIAL</strong></TableCell>
                            <TableCell><strong>ACTIVO</strong></TableCell>
                            <TableCell align="center"><strong>SMART</strong></TableCell>
                            <TableCell align="center"><strong>ACCIONES</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Box sx={{ opacity: 0.5 }}>
                                        <SearchIcon sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography>No se encontraron equipos en esta categoría</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
                                <TableRow key={item.id || index} hover>
                                    <TableCell>{item.item_number}</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>{item.room_number}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getEquipmentIcon(item.equipment_type)} {item.equipment_type}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.model || '-'}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{item.serial_number || '-'}</TableCell>
                                    <TableCell>
                                        <Chip label={item.asset_number || 'SIN ACT'} size="small" color={item.asset_number ? "default" : "warning"} variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">
                                        {item.equipment_type.toLowerCase().includes('televisor') && (
                                            <Chip
                                                label={item.is_smart_tv ? "SI" : "NO"} size="small"
                                                color={item.is_smart_tv ? "success" : "default"}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="primary" onClick={() => handleEdit(item)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(item)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]} component="div"
                    count={filteredItems.length} rowsPerPage={rowsPerPage} page={page}
                    onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </TableContainer>

            {/* Dialog de Edición */}
            <Dialog open={editDialogOpen} onClose={() => !saving && setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>Editar Equipo</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Habitación"
                            value={selectedItem?.room_number || ''}
                            onChange={(e) => setSelectedItem(prev => prev ? { ...prev, room_number: e.target.value } : null)}
                            disabled={saving}
                        />
                        <TextField
                            fullWidth
                            select
                            label="Tipo de Equipo"
                            value={selectedItem?.equipment_type || ''}
                            onChange={(e) => setSelectedItem(prev => prev ? { ...prev, equipment_type: e.target.value } : null)}
                            disabled={saving}
                        >
                            {equipmentTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Modelo"
                            value={selectedItem?.model || ''}
                            onChange={(e) => setSelectedItem(prev => prev ? { ...prev, model: e.target.value } : null)}
                            disabled={saving}
                        />
                        <TextField
                            fullWidth
                            label="Número de Serial"
                            value={selectedItem?.serial_number || ''}
                            onChange={(e) => setSelectedItem(prev => prev ? { ...prev, serial_number: e.target.value } : null)}
                            disabled={saving}
                        />
                        <TextField
                            fullWidth
                            label="Número de Activo"
                            value={selectedItem?.asset_number || ''}
                            onChange={(e) => setSelectedItem(prev => prev ? { ...prev, asset_number: e.target.value } : null)}
                            disabled={saving}
                        />
                        {selectedItem?.equipment_type.toLowerCase().includes('televisor') && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedItem?.is_smart_tv || false}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedItem(prev => prev ? { ...prev, is_smart_tv: e.target.checked } : null)}
                                        disabled={saving}
                                    />
                                }
                                label="Es Smart TV"
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
                        {saving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de Confirmación de Eliminación */}
            <Dialog open={deleteDialogOpen} onClose={() => !saving && setDeleteDialogOpen(false)}>
                <DialogTitle>¿Confirmar eliminación?</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar el equipo de la habitación <strong>{selectedItem?.room_number}</strong>?
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" disabled={saving}>
                        {saving ? <CircularProgress size={24} /> : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- Subcomponent: Manual Entry Form ---
const ManualEntryForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        item_number: 0,
        equipment_type: 'TELEVISOR',
        room_number: '',
        model: '',
        serial_number: '',
        asset_number: '',
        is_smart_tv: false
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const equipmentTypes = ['TELEVISOR', 'NEVERA', 'WIFI', 'TELEFONO', 'DECODIFICADOR', 'OTRO'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.room_number) {
            setError('El número de habitación es obligatorio');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const { error: insertError } = await supabase
                .from('equipment_inventory')
                .upsert([{
                    id: generateUUID(),
                    item_number: formData.item_number || 0,
                    equipment_type: formData.equipment_type || 'TELEVISOR',
                    room_number: formData.room_number,
                    model: formData.model || '',
                    serial_number: formData.serial_number || '',
                    asset_number: formData.asset_number || '',
                    is_smart_tv: formData.is_smart_tv || false,
                    updated_at: new Date().toISOString()
                }], {
                    onConflict: 'room_number, equipment_type'
                });

            if (insertError) throw insertError;

            // Reset form
            setFormData({
                item_number: 0,
                equipment_type: 'TELEVISOR',
                room_number: '',
                model: '',
                serial_number: '',
                asset_number: '',
                is_smart_tv: false
            });

            onSuccess();
        } catch (err: unknown) {
            setError('Error al guardar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
        } finally {
            setSaving(false);
        }
    };


    return (
        <Box component="form" onSubmit={handleSubmit}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                        <TextField
                            fullWidth
                            label="Número de Habitación *"
                            value={formData.room_number}
                            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                            required
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                        <TextField
                            fullWidth
                            select
                            label="Tipo de Equipo *"
                            value={formData.equipment_type}
                            onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                        >
                            {equipmentTypes.map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                        <TextField
                            fullWidth
                            label="Modelo"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                        <TextField
                            fullWidth
                            label="Número de Serial"
                            value={formData.serial_number}
                            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                        />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                        <TextField
                            fullWidth
                            label="Número de Activo"
                            value={formData.asset_number}
                            onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })}
                        />
                    </Box>

                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Número de Item"
                            value={formData.item_number}
                            onChange={(e) => setFormData({ ...formData, item_number: parseInt(e.target.value) || 0 })}
                        />
                    </Box>
                </Box>

                {formData.equipment_type === 'TELEVISOR' && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                sx={{ color: 'rgba(255,255,255,0.7)' }}
                                checked={formData.is_smart_tv}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_smart_tv: e.target.checked })}
                            />
                        }
                        label="¿Es Smart TV?"
                    />
                )}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <AddIcon />}
                    sx={{ borderRadius: '12px', py: 1.5 }}
                >
                    {saving ? 'Guardando...' : 'Agregar Equipo'}
                </Button>
            </Stack>
        </Box>
    );
};

// --- Subcomponent: InventoryUpload ---
const InventoryUploadForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<InventoryItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const parseExcel = (selectedFile: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const bstr = e.target?.result as string;
                const workbook = XLSX.read(bstr, { type: 'binary' });

                // Buscar la hoja que tiene datos reales (buscando la palabra HABITACION)
                let sheetName = workbook.SheetNames[0];
                for (const name of workbook.SheetNames) {
                    const ws = workbook.Sheets[name];
                    const raw = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
                    const hasData = raw.some(row => row.some(cell => String(cell || '').toUpperCase().includes('HABITACION')));
                    if (hasData) {
                        sheetName = name;
                        break;
                    }
                }

                const worksheet = workbook.Sheets[sheetName];
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

                // Encontrar la fila de headers (buscar "ITEM" o "HABITACION")
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(10, rawData.length); i++) {
                    const rowStr = rawData[i].map(c => String(c || '').toUpperCase().trim());
                    if (rowStr.includes('HABITACION') || rowStr.includes('ITEM') || rowStr.includes('EQUIPO')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) throw new Error('No se encontraron los encabezados correctos en el archivo.');

                const headers = rawData[headerRowIndex].map(h => String(h || '').toUpperCase().trim());
                const findCol = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

                const idxItem = findCol(['ITEM', 'NRO', '#']);
                const idxHab = findCol(['HABITACION', 'ROOM']);
                const idxMarca = findCol(['MARCA', 'BRAND', 'TV - MARCA']);
                const idxModelo = findCol(['MODELO', 'MODEL', 'TV - MODELO']);
                const idxSerial = findCol(['SERIAL', 'SERIE', 'TV - SERIAL']);
                const idxActivo = findCol(['ACTIVO', 'ASSET', 'TV - # ACTIVO']);
                const idxEquipo = findCol(['EQUIPO', 'TIPO', 'EQUIPMENT']);
                const idxSmart = findCol(['SMART']);

                const mappedDataMap = new Map<string, InventoryItem>();

                for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                    const row = rawData[i];
                    const hab = String(row[idxHab] || '').trim();

                    if (!hab || hab === '') continue;

                    const marca = idxMarca !== -1 ? String(row[idxMarca] || '') : '';
                    const modelo = idxModelo !== -1 ? String(row[idxModelo] || '') : '';
                    const equipo = idxEquipo !== -1 ? String(row[idxEquipo] || 'TELEVISOR').toUpperCase() : 'TELEVISOR';

                    const uniqueKey = `${hab}_${equipo}`;

                    mappedDataMap.set(uniqueKey, {
                        id: generateUUID(),
                        item_number: Number(row[idxItem]) || mappedDataMap.size + 1,
                        equipment_type: equipo,
                        room_number: hab,
                        model: (marca + ' ' + modelo).trim() || '',
                        serial_number: idxSerial !== -1 ? String(row[idxSerial] || '') : '',
                        asset_number: idxActivo !== -1 ? String(row[idxActivo] || '') : '',
                        is_smart_tv: idxSmart !== -1 ? ['SI', 'SÍ', 'YES', 'X', 'TRUE', '1'].includes(String(row[idxSmart] || '').toUpperCase().trim()) : false,
                        updated_at: new Date().toISOString()
                    });
                }

                const finalData = Array.from(mappedDataMap.values());
                if (finalData.length === 0) throw new Error('No se encontraron filas con datos válidos.');

                setPreviewData(finalData);
                setShowPreviewModal(true);
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError('❌ Error: ' + err.message);
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleUpload = async () => {
        setIsUploading(true);
        try {
            const { error: upsertError } = await supabase
                .from('equipment_inventory')
                .upsert(previewData, { onConflict: 'room_number, equipment_type' });

            if (upsertError) throw upsertError;

            setFile(null);
            setPreviewData([]);
            setShowPreviewModal(false);
            onSuccess();
        } catch (err: any) {
            setError('❌ Error de base de datos: ' + (err.message || 'Error desconocido'));
        } finally {
            setIsUploading(false);
        }
    };

    const getEquipmentIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('tv') || t.includes('televisor')) return <TvIcon color="primary" fontSize="small" />;
        if (t.includes('nevera')) return <KitchenIcon color="secondary" fontSize="small" />;
        if (t.includes('wifi')) return <WifiIcon color="info" fontSize="small" />;
        return <DevicesOtherIcon fontSize="small" />;
    };

    return (
        <Box>
            <input
                type="file"
                id="excel-upload"
                hidden
                accept=".xlsx,.xls"
                onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) {
                        setFile(selected);
                        parseExcel(selected);
                    }
                }}
            />
            <Box
                sx={{
                    border: '2px dashed #1a237e',
                    borderRadius: '20px',
                    p: 6,
                    textAlign: 'center',
                    cursor: 'pointer',
                    mb: 3,
                    bgcolor: '#f8f9fa',
                    '&:hover': { bgcolor: '#f0f2f5' }
                }}
                onClick={() => document.getElementById('excel-upload')?.click()}
            >
                <CloudUploadIcon sx={{ fontSize: 60, mb: 2, color: '#1a237e' }} />
                <Typography variant="h6" color="primary">{file ? file.name : 'Cargar Inventario Excel'}</Typography>
                <Typography variant="body2" color="textSecondary">Haz clic para seleccionar o arrastra el archivo</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Dialog open={showPreviewModal} onClose={() => setShowPreviewModal(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">📋 Vista Previa de Carga ({previewData.length} equipos)</Typography>
                    <IconButton onClick={() => setShowPreviewModal(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>HABITACIÓN</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>TIPO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>MODELO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>SERIAL</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ACTIVO</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>SMART</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {previewData.map((item, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{item.room_number}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getEquipmentIcon(item.equipment_type)}
                                                {item.equipment_type}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{item.model}</TableCell>
                                        <TableCell>{item.serial_number}</TableCell>
                                        <TableCell><Chip label={item.asset_number || 'SIN ACT'} size="small" variant="outlined" /></TableCell>
                                        <TableCell align="center">
                                            {item.equipment_type.includes('TELEVISOR') || item.equipment_type.includes('TV') ? (
                                                <Chip label={item.is_smart_tv ? "SÍ" : "NO"} size="small" color={item.is_smart_tv ? "success" : "default"} />
                                            ) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShowPreviewModal(false)}>Cancelar</Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={isUploading}
                        startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    >
                        {isUploading ? 'Guardando...' : 'Confirmar y Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- Main Component ---
const InventoryManagement: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('equipment_inventory').select('*').order('room_number');
        if (error) {
            setNotification({ open: true, message: error.message, severity: 'error' });
        } else {
            setInventory(data || []);
        }
        setLoading(false);
    };

    useEffect(() => { fetchInventory(); }, []);

    const handleSuccess = () => {
        setTabValue(0);
        fetchInventory();
        setNotification({ open: true, message: 'Equipo agregado exitosamente', severity: 'success' });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 800, color: '#1a237e' }}>Inventario de Equipos</Typography>
            <Paper sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} variant="fullWidth">
                    <Tab label="Ver Inventario" />
                    <Tab label="Agregar Manualmente" icon={<AddIcon />} iconPosition="start" />
                    <Tab label="Cargar Excel" icon={<CloudUploadIcon />} iconPosition="start" />
                </Tabs>
                <Box sx={{ p: 3 }}>
                    {tabValue === 0 && (loading ? <CircularProgress /> : <InventoryTableDisplay items={inventory} onUpdate={fetchInventory} />)}
                    {tabValue === 1 && <ManualEntryForm onSuccess={handleSuccess} />}
                    {tabValue === 2 && <InventoryUploadForm onSuccess={handleSuccess} />}
                </Box>
            </Paper>
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default InventoryManagement;
