import React, { useState } from 'react';
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
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { PictureAsPdf } from '@mui/icons-material';
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
    const [amount, setAmount] = useState<string>('');
    const [requestItems, setRequestItems] = useState<RequestItem[]>([]);

    const handleAddItem = () => {
        if (!selectedAccount || !amount || parseFloat(amount) <= 0) return;

        const newItem: RequestItem = {
            id: selectedAccount.id,
            accountAlias: selectedAccount.alias || selectedAccount.email,
            amount: parseFloat(amount)
        };

        // Check if already added? Maybe allow duplicates or update existing? 
        // Let's allow multiple entries or update existing for now.
        // Assuming unique alias/account in list is better.
        const existingIndex = requestItems.findIndex(item => item.id === selectedAccount.id);
        if (existingIndex >= 0) {
            // Update existing
            const updated = [...requestItems];
            updated[existingIndex].amount = parseFloat(amount); // Overwrite or add? User likely wants to set the specific amount for the reload.
            setRequestItems(updated);
        } else {
            setRequestItems([...requestItems, newItem]);
        }

        setSelectedAccount(null);
        setAmount('');
    };

    const handleDeleteItem = (id: string) => {
        setRequestItems(requestItems.filter(item => item.id !== id));
    };

    const totalAmount = requestItems.reduce((sum, item) => sum + item.amount, 0);

    const generatePDF = () => {
        const doc = new jsPDF();

        // -- Header --
        // Use a simple box or text for the logo placeholder if no image available.
        // "IKIN MARGARITA HOTEL & SPA" text centered
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
        doc.text(totalAmount.toFixed(2), 120, yPos, { align: "right" });
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.line(80, yPos + 1, 122, yPos + 1);

        // Checkboxes generic
        doc.rect(130, yPos - 3, 4, 4);
        doc.text("Bolivares", 136, yPos);
        doc.text("x", 131, yPos); // checked for Bolivares? Or Dollars? 
        // User image shows "x" in Bolivares box. But amounts in image show "0,00".
        // Let's assume user might want Dollars too, but for now replicate image.
        doc.rect(130, yPos + 2, 4, 4);
        doc.text("US Dollars", 136, yPos + 5);


        yPos += 8;
        doc.text("Favor efectuar pago en la siguiente fecha:", 14, yPos);
        doc.line(90, yPos + 1, 130, yPos + 1); // line

        yPos += 6;
        doc.text("Descripción general:", 14, yPos);
        doc.setTextColor(0, 0, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Pago de servicio SimpleTV, cuentas varias:", 60, yPos);
        doc.setTextColor(0, 0, 0);
        // doc.line(60, yPos+1, 190, yPos+1);

        // -- Table --
        // Using autoTable
        yPos += 10;

        const tableBody = requestItems.map(item => [
            item.accountAlias,
            "", // Factura No.
            "", // Cuenta de Gasto
            item.amount.toFixed(2)
        ]);

        // Add empty rows to fill space if needed, similar to image
        const minRows = 10;
        while (tableBody.length < minRows) {
            tableBody.push(["", "", "", ""]);
        }

        autoTable(doc, {
            startY: yPos,
            head: [['Concepto o Descripción de Pago', 'Factura No.', 'Cuenta de Gasto', 'Total a Pagar']],
            body: tableBody,
            theme: 'plain', // To look like the image (clean)
            styles: {
                lineColor: [0, 0, 0], // Black borders? Or Green/Dotted?
                lineWidth: 0.1,
                cellPadding: 1,
                fontSize: 10,
                textColor: 0
            },
            headStyles: {
                fillColor: [200, 255, 200], // Light green header
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
            didDrawPage: (data) => {
                // Ensure footer is drawn
            }
        });

        // Get final Y from table
        const finalY = (doc as any).lastAutoTable.finalY + 5;

        // Subtotal / Total
        doc.setFillColor(200, 255, 200);
        doc.rect(110, finalY, 40, 8, 'F'); // Green bg for labels
        doc.rect(110, finalY + 8, 40, 8, 'F');

        doc.setFont("helvetica", "bold");
        doc.text("Subtotal:", 112, finalY + 6);
        doc.text("Total a Pagar:", 112, finalY + 14);

        doc.setTextColor(0, 0, 255);
        doc.text(totalAmount.toFixed(2), 190, finalY + 6, { align: "right" });
        doc.text(totalAmount.toFixed(2), 190, finalY + 14, { align: "right" });
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

        // Box 1
        doc.roundedRect(14, sigY, boxWidth, boxHeight, 3, 3);
        doc.setFontSize(7);
        doc.text("SOLICITADO POR:", 20, sigY + 5);

        // Box 2
        doc.roundedRect(14 + boxWidth + gap, sigY, boxWidth, boxHeight, 3, 3);
        doc.text("APROBADO POR:", 14 + boxWidth + gap + 5, sigY + 5);
        doc.text("Jefe de Departamento", 14 + boxWidth + gap + 5, sigY + 10);

        // Box 3
        doc.roundedRect(14 + (boxWidth + gap) * 2, sigY, boxWidth, boxHeight, 3, 3);
        doc.text("APROBADO POR:", 14 + (boxWidth + gap) * 2 + 5, sigY + 5);
        doc.text("Contralor General,", 14 + (boxWidth + gap) * 2 + 5, sigY + 10);
        doc.text("Subcontralor o Gerente", 14 + (boxWidth + gap) * 2 + 5, sigY + 15);
        doc.text("General", 14 + (boxWidth + gap) * 2 + 5, sigY + 19);

        doc.save('solicitud_cheque_simple_tv.pdf');
    };


    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Generar Solicitud de Cheque</DialogTitle>
            <DialogContent dividers>
                <Box mb={3} display="flex" gap={2}>
                    <Autocomplete
                        options={accounts}
                        getOptionLabel={(option) => option.alias || option.email}
                        value={selectedAccount}
                        onChange={(_, newValue) => setSelectedAccount(newValue)}
                        renderInput={(params) => <TextField {...params} label="Seleccionar Cuenta" />}
                        sx={{ flex: 2 }}
                    />
                    <TextField
                        label="Monto"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddItem}
                        disabled={!selectedAccount || !amount}
                    >
                        Agregar
                    </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Cuenta / Alias</TableCell>
                                <TableCell align="right">Monto</TableCell>
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
                                        <TableCell align="right">{item.amount.toFixed(2)}</TableCell>
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
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</TableCell>
                                    <TableCell />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    startIcon={<PictureAsPdf />}
                    onClick={generatePDF}
                    disabled={requestItems.length === 0}
                    color="primary"
                >
                    Descargar PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
};
