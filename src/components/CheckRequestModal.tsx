import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    InputAdornment,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    Chip,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { PictureAsPdf, CurrencyExchange } from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

interface Account {
    id: string;
    alias: string;
    email: string;
}

interface RequestItem {
    id: string; // Account ID
    accountAlias: string;
    amount: number;
}

interface CheckRequestModalProps {
    open: boolean;
    onClose: () => void;
    accounts: Account[];
}

export const CheckRequestModal: React.FC<CheckRequestModalProps> = ({ open, onClose, accounts }) => {
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [inputAmount, setInputAmount] = useState<string>('');
    const [requestItems, setRequestItems] = useState<RequestItem[]>([]);

    // Currency & Exchange Rate State
    const [exchangeRate, setExchangeRate] = useState<number>(0);
    const [loadingRate, setLoadingRate] = useState<boolean>(false);
    const [checkCurrency, setCheckCurrency] = useState<'VES' | 'USD'>('VES');
    const [useUSDInput, setUseUSDInput] = useState<boolean>(false); // If true, input is in USD, converted to VES for the table

    useEffect(() => {
        if (open) {
            fetchExchangeRate();
        }
    }, [open]);

    const fetchExchangeRate = async () => {
        setLoadingRate(true);
        try {
            const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
            const data = await response.json();
            if (data && data.promedio) {
                setExchangeRate(data.promedio);
            }
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
        } finally {
            setLoadingRate(false);
        }
    };

    const handleAddItem = () => {
        if (!selectedAccount || !inputAmount || parseFloat(inputAmount) <= 0) return;

        let finalAmount = parseFloat(inputAmount);

        // Conversion logic
        if (checkCurrency === 'VES' && useUSDInput) {
            finalAmount = finalAmount * exchangeRate;
        }

        const newItem: RequestItem = {
            id: selectedAccount.id,
            accountAlias: selectedAccount.alias || selectedAccount.email,
            amount: finalAmount
        };

        const existingIndex = requestItems.findIndex(item => item.id === selectedAccount.id);
        if (existingIndex >= 0) {
            const updated = [...requestItems];
            updated[existingIndex].amount = finalAmount;
            setRequestItems(updated);
        } else {
            setRequestItems([...requestItems, newItem]);
        }

        setSelectedAccount(null);
        setInputAmount('');
    };

    const handleDeleteItem = (id: string) => {
        setRequestItems(requestItems.filter(item => item.id !== id));
    };

    const totalAmount = requestItems.reduce((sum, item) => sum + item.amount, 0);

    // Preview State
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const generatePDF = async (action: 'download' | 'preview') => {
        const doc = new jsPDF();

        // Helper to load image
        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        };

        try {
            // Load Logo
            const logoImg = await loadImage('/hotel-ikin.jpg');
            // Add Logo (Top-Left) - Adjust dimensions as needed
            // x=10, y=10, w=30, h=30 (approx square, or adjust to aspect ratio)
            const logoWidth = 35;
            const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
            doc.addImage(logoImg, 'JPEG', 10, 5, logoWidth, logoHeight);
        } catch (e) {
            console.warn("Could not load logo:", e);
        }

        // -- Header --
        // Top Logo Area (Placeholder)
        // Title Center
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("HOTEL KARIBIK PLAYA CARDON C.A", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text("RIF: J-00221700-6", 105, 26, { align: "center" });
        doc.setFontSize(14);
        doc.text("SOLICITUD DE CHEQUE", 105, 34, { align: "center" });

        // -- Info Block --
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        let yPos = 50;
        doc.text("Fecha de Solicitud:", 14, yPos);
        // Box for date
        doc.rect(50, yPos - 5, 40, 7);
        doc.text(dayjs().format('DD/MM/YYYY'), 52, yPos);

        // Box for Accounting use
        doc.rect(140, yPos - 10, 60, 20);
        doc.setFontSize(8);
        doc.text("CONTABILIDAD UNICAMENTE:", 142, yPos - 6);
        doc.text("Fecha / Recibido por:", 142, yPos - 1);

        yPos += 15;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Beneficiario (Girar el cheque a nombre de):", 14, yPos);

        yPos += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Beneficiary Details
        const labelX = 14;
        const valueX = 60;
        const lineYGap = 6;

        doc.text("R.I.F.:", labelX, yPos);
        doc.line(valueX, yPos, 100, yPos); // dotted line simulator?

        yPos += lineYGap;
        doc.text("Nombre del Proveedor:", labelX, yPos);
        doc.setTextColor(0, 0, 255); // Blue color for fixed values
        doc.setFont("helvetica", "bold");
        doc.text("SIMPLE TV", valueX, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.line(valueX, yPos + 1, 130, yPos + 1); // Underline

        yPos += lineYGap;
        doc.text("Dirección Proveedor:", labelX, yPos);
        doc.setTextColor(0, 0, 255);
        doc.setFont("helvetica", "bold");
        doc.text("PORLAMAR", valueX, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.line(valueX, yPos + 1, 130, yPos + 1);

        yPos += lineYGap;
        doc.text("Ciudad y País:", labelX, yPos);
        doc.setTextColor(0, 0, 255);
        doc.setFont("helvetica", "bold");
        doc.text("VENEZUELA", valueX, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.line(valueX, yPos + 1, 100, yPos + 1);

        yPos += lineYGap;
        doc.text("Teléfonos:", labelX, yPos);
        doc.text("Fax:", 120, yPos);

        // -- Payment Description --
        yPos += 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Monto a pagar y descripción del pago:", 14, yPos);

        yPos += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Monto a Pagar:", 14, yPos);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 255);

        // Format Amount
        doc.text(totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 120, yPos, { align: "right" });

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.line(80, yPos + 1, 122, yPos + 1);

        // Checkboxes generic
        doc.rect(130, yPos - 3, 4, 4);
        doc.text("Bolivares", 136, yPos);
        if (checkCurrency === 'VES') {
            doc.text("x", 131, yPos);
        }

        doc.rect(130, yPos + 2, 4, 4);
        doc.text("US Dollars", 136, yPos + 5);
        if (checkCurrency === 'USD') {
            doc.text("x", 131, yPos + 5);
        }

        yPos += 8;
        doc.text("Favor efectuar pago en la siguiente fecha:", 14, yPos);
        doc.line(90, yPos + 1, 130, yPos + 1);

        yPos += 6;
        doc.text("Descripción general:", 14, yPos);
        doc.setTextColor(0, 0, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Pago de servicio SimpleTV, cuentas varias:", 60, yPos);
        doc.setTextColor(0, 0, 0);

        // -- Table --
        yPos += 10;

        const tableBody = requestItems.map(item => [
            item.accountAlias,
            "", // Factura No.
            "", // Cuenta de Gasto
            item.amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ]);

        const minRows = 10;
        while (tableBody.length < minRows) {
            tableBody.push(["", "", "", ""]);
        }

        autoTable(doc, {
            startY: yPos,
            head: [['Concepto o Descripción de Pago', 'Factura No.', 'Cuenta de Gasto', 'Total a Pagar']],
            body: tableBody,
            theme: 'plain',
            styles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                cellPadding: 1,
                fontSize: 10,
                textColor: 0
            },
            headStyles: {
                fillColor: [200, 255, 200],
                textColor: 0,
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.1,
                lineColor: 0
            },
            columnStyles: {
                0: { cellWidth: 100 },
                3: { halign: 'right' }
            },
        });

        // Get final Y from table
        const finalY = (doc as any).lastAutoTable.finalY + 5;

        // Subtotal / Total
        doc.setFillColor(200, 255, 200);
        doc.rect(110, finalY, 40, 8, 'F');
        doc.rect(110, finalY + 8, 40, 8, 'F');

        doc.setFont("helvetica", "bold");
        doc.text("Subtotal:", 112, finalY + 6);
        doc.text("Total a Pagar:", 112, finalY + 14);

        doc.setTextColor(0, 0, 255);
        doc.text(totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 190, finalY + 6, { align: "right" });
        doc.text(totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 190, finalY + 14, { align: "right" });
        doc.setTextColor(0, 0, 0);

        // Instructions
        const instrY = finalY + 5;
        doc.setFont("helvetica", "normal");
        doc.text("Instrucciones especiales:", 14, instrY);
        doc.line(60, instrY + 1, 105, instrY + 1);

        // Signatures boxes
        const sigY = finalY + 35;
        const boxWidth = 50;
        const boxHeight = 25;
        const gap = 10;

        doc.roundedRect(14, sigY, boxWidth, boxHeight, 3, 3);
        doc.setFontSize(7);
        doc.text("SOLICITADO POR:", 20, sigY + 5);

        doc.roundedRect(14 + boxWidth + gap, sigY, boxWidth, boxHeight, 3, 3);
        doc.text("APROBADO POR:", 14 + boxWidth + gap + 5, sigY + 5);
        doc.text("Jefe de Departamento", 14 + boxWidth + gap + 5, sigY + 10);

        doc.roundedRect(14 + (boxWidth + gap) * 2, sigY, boxWidth, boxHeight, 3, 3);
        doc.text("APROBADO POR:", 14 + (boxWidth + gap) * 2 + 5, sigY + 5);
        doc.text("Contralor General,", 14 + (boxWidth + gap) * 2 + 5, sigY + 10);
        doc.text("Subcontralor o Gerente", 14 + (boxWidth + gap) * 2 + 5, sigY + 15);
        doc.text("General", 14 + (boxWidth + gap) * 2 + 5, sigY + 19);

        // Add small Rate note if VES
        if (checkCurrency === 'VES' && exchangeRate > 0) {
            doc.setFontSize(6);
            doc.text(`Tasa Ref: ${exchangeRate.toFixed(2)} Bs/$`, 170, 20);
        }

        if (action === 'download') {
            doc.save('solicitud_cheque_simple_tv.pdf');
        } else {
            const pdfBlob = doc.output('bloburl');
            setPreviewUrl(pdfBlob.toString()); // blob:url
            setPreviewOpen(true);
        }
    };


    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" component="div">Generar Solicitud de Cheque</Typography>
                    {exchangeRate > 0 && (
                        <Chip
                            icon={<CurrencyExchange />}
                            label={`Tasa: Bs ${exchangeRate.toFixed(2)}`}
                            color="success"
                            variant="outlined"
                        />
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {/* Configuration Section */}
                    <Box mb={3} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Moneda del Cheque</FormLabel>
                            <RadioGroup
                                row
                                value={checkCurrency}
                                onChange={(e) => {
                                    setCheckCurrency(e.target.value as 'VES' | 'USD');
                                    if (e.target.value === 'USD') setUseUSDInput(false);
                                }}
                            >
                                <FormControlLabel value="VES" control={<Radio />} label="Bolívares (Bs)" />
                                <FormControlLabel value="USD" control={<Radio />} label="Dólares ($)" />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <Box mb={3} display="flex" gap={2} alignItems="flex-start" flexWrap="wrap" flexDirection={{ xs: 'column', sm: 'row' }}>
                        <Autocomplete
                            options={accounts}
                            getOptionLabel={(option) => option.alias || option.email}
                            value={selectedAccount}
                            onChange={(_, newValue) => setSelectedAccount(newValue)}
                            renderInput={(params) => <TextField {...params} label="Seleccionar Cuenta" />}
                            sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '250px' } }}
                        />

                        <Box display="flex" flexDirection="column" gap={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                            <TextField
                                label={useUSDInput ? "Monto ($ USD)" : `Monto (${checkCurrency === 'VES' ? 'Bs' : '$'})`}
                                type="number"
                                value={inputAmount}
                                onChange={(e) => setInputAmount(e.target.value)}
                                sx={{ width: { xs: '100%', sm: '150px' } }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">{useUSDInput || checkCurrency === 'USD' ? '$' : 'Bs'}</InputAdornment>,
                                }}
                            />
                            {checkCurrency === 'VES' && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={useUSDInput}
                                            onChange={(e) => setUseUSDInput(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Calcular desde Divisa ($)</Typography>}
                                />
                            )}
                            {checkCurrency === 'VES' && useUSDInput && inputAmount && (
                                <Typography variant="caption" color="text.secondary">
                                    ≈ Bs {(parseFloat(inputAmount) * exchangeRate).toFixed(2)}
                                </Typography>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            onClick={handleAddItem}
                            disabled={!selectedAccount || !inputAmount}
                            sx={{ mt: { xs: 0, sm: 1 }, width: { xs: '100%', sm: 'auto' }, height: '56px' }}
                        >
                            Agregar
                        </Button>
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Cuenta / Alias</TableCell>
                                    <TableCell align="right">Monto ({checkCurrency})</TableCell>
                                    <TableCell align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requestItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">No hay items agregados</TableCell>
                                    </TableRow>
                                ) : (
                                    requestItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.accountAlias}</TableCell>
                                            <TableCell align="right">{item.amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
                                                    <DeleteIcon color="error" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                {requestItems.length > 0 && (
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                </DialogContent>
                <DialogActions sx={{ flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1, p: 2 }}>
                    <Button onClick={onClose} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancelar</Button>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                            variant="outlined"
                            onClick={() => generatePDF('preview')}
                            disabled={requestItems.length === 0 || loadingRate}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Vista Previa
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={loadingRate ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
                            onClick={() => generatePDF('download')}
                            disabled={requestItems.length === 0 || loadingRate}
                            color="primary"
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                            Descargar PDF
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Vista Previa del Documento</DialogTitle>
                <DialogContent dividers sx={{ height: '80vh', p: 0 }}>
                    {previewUrl && (
                        <iframe
                            src={previewUrl}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            title="PDF Preview"
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setPreviewOpen(false);
                            generatePDF('download');
                        }}
                        color="primary"
                    >
                        Descargar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
