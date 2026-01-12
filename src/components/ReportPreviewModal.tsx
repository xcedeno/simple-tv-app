
import React, { useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Chip
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { Close, Download } from '@mui/icons-material';

interface Account {
    email: string;
    alias: string;
    devices: {
        decoder_id: string;
        cutoff_date: string;
        room_number: string;
    }[];
}

interface ReportPreviewModalProps {
    open: boolean;
    onClose: () => void;
    accounts: Account[];
}

interface GroupedData {
    alias: string;
    rooms: string;
    cutoffs: string;
    rawCutoffs: string[]; // for debugging or advanced sorting if needed
    minDaysLeft: number;
    status: 'Vencido' | 'Por Vencer' | 'Activo';
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({ open, onClose, accounts }) => {

    const reportData = useMemo(() => {
        const grouped: GroupedData[] = [];
        const today = dayjs();

        accounts.forEach(acc => {
            if (!acc.devices || !Array.isArray(acc.devices) || acc.devices.length === 0) return;

            const rooms = new Set<string>();
            const cutoffs = new Set<string>();
            let minDaysLeft = Infinity;
            let worstStatus: GroupedData['status'] = 'Activo';

            acc.devices.forEach(dev => {
                // Rooms
                if (dev.room_number) rooms.add(dev.room_number);

                // Dates
                const cutoff = dayjs(dev.cutoff_date);
                cutoffs.add(cutoff.format('DD/MM/YYYY'));

                // Status
                const daysLeft = cutoff.diff(today, 'day');
                if (daysLeft < minDaysLeft) minDaysLeft = daysLeft;

                let specificStatus: GroupedData['status'] = 'Activo';
                if (daysLeft < 0) specificStatus = 'Vencido';
                else if (daysLeft <= 7) specificStatus = 'Por Vencer';

                // Prioritize worst status: Vencido > Por Vencer > Activo
                if (specificStatus === 'Vencido') worstStatus = 'Vencido';
                else if (specificStatus === 'Por Vencer' && worstStatus !== 'Vencido') worstStatus = 'Por Vencer';
            });

            grouped.push({
                alias: acc.alias || acc.email,
                rooms: Array.from(rooms).join(', '),
                cutoffs: Array.from(cutoffs).join('\n'), // Newline for stacked dates in PDF/Table
                rawCutoffs: Array.from(cutoffs),
                minDaysLeft,
                status: worstStatus
            });
        });

        // Sort: Vencido -> Por Vencer -> Activo
        return grouped.sort((a, b) => {
            const statusOrder = { 'Vencido': 0, 'Por Vencer': 1, 'Activo': 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            return a.minDaysLeft - b.minDaysLeft;
        });
    }, [accounts]);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Reporte de Estado de Cuentas', 14, 22);

        doc.setFontSize(11);
        doc.text(`Fecha de generación: ${dayjs().format('DD/MM/YYYY HH:mm')}`, 14, 30);

        // Table
        const tableColumn = ["Cliente / Alias", "Habitaciones", "Vencimiento(s)", "Estado"];
        const tableRows: any[] = [];

        reportData.forEach(item => {
            const rowData = [
                item.alias,
                item.rooms,
                item.cutoffs,
                item.status
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            styles: { fontSize: 10, cellPadding: 3, valign: 'middle' },
            headStyles: { fillColor: [26, 35, 126], textColor: [255, 255, 255], halign: 'center' },
            columnStyles: {
                0: { cellWidth: 70 }, // Alias
                1: { cellWidth: 40 }, // Habitaciones
                2: { cellWidth: 40, halign: 'center' }, // Vencimiento
                3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }  // Estado
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 3) {
                    const status = data.cell.raw;
                    if (status === 'Vencido') {
                        data.cell.styles.textColor = [198, 40, 40]; // Red
                    } else if (status === 'Por Vencer') {
                        data.cell.styles.textColor = [239, 108, 0]; // Orange
                    } else {
                        data.cell.styles.textColor = [46, 125, 50]; // Green
                    }
                }
            }
        });

        doc.save(`reporte_cuentas_${dayjs().format('YYYY-MM-DD')}.pdf`);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Vista Previa del Reporte
                <Button onClick={onClose} color="inherit" size="small"><Close /></Button>
            </DialogTitle>
            <DialogContent dividers>
                <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Este reporte agrupa las cuentas y muestra el estado más crítico.
                    </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} variant="outlined">
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Cliente</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Habitaciones</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Vencimiento(s)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.map((row, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{row.alias}</TableCell>
                                    <TableCell>{row.rooms}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'pre-line' }}>{row.cutoffs}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status}
                                            size="small"
                                            color={row.status === 'Vencido' ? 'error' : row.status === 'Por Vencer' ? 'warning' : 'success'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancelar</Button>
                <Button
                    onClick={handleDownloadPDF}
                    variant="contained"
                    startIcon={<Download />}
                    sx={{
                        width: { xs: '100%', sm: 'auto' },
                        bgcolor: '#1a237e',
                        '&:hover': { bgcolor: '#0d47a1' }
                    }}
                >
                    Descargar PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
};
