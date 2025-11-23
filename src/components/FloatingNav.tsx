import React, { useState } from 'react';
import { Box, SpeedDial, SpeedDialIcon, SpeedDialAction, useTheme, useMediaQuery, Fab, Tooltip } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';

export const FloatingNav: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const actions = [
        { icon: <AddCircleOutlineIcon />, name: 'Formulario', path: '/form', color: 'primary' as const },
        { icon: <ListAltIcon />, name: 'Lista', path: '/list', color: 'secondary' as const },
        { icon: <CreditCardIcon />, name: 'Tarjetas', path: '/cards', color: 'warning' as const },
        { icon: <AssessmentIcon />, name: 'Reportes', path: '/reports', color: 'success' as const },
    ];

    const handleActionClick = (path: string) => {
        navigate(path);
        setOpen(false);
    };

    if (!isMobile) {
        // Desktop: Show expanded list
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    zIndex: 1400,
                    display: 'flex',
                    gap: 2,
                }}
            >
                {actions.map((action) => (
                    <Tooltip key={action.name} title={action.name} arrow>
                        <Fab
                            component={Link} // Use Link component directly for desktop
                            to={action.path}
                            color={action.color}
                            size="small"
                            aria-label={action.name}
                            sx={{
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                                transition: 'transform 0.2s',
                            }}
                        >
                            {action.icon}
                        </Fab>
                    </Tooltip>
                ))}
            </Box>
        );
    }

    // Mobile: Show SpeedDial
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 1400,
                transform: 'translateZ(0px)',
                flexGrow: 1,
            }}
        >
            <SpeedDial
                ariaLabel="Navegación Rápida"
                sx={{ position: 'absolute', top: 0, right: 0 }}
                icon={<SpeedDialIcon openIcon={<EditIcon />} />}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                direction="down"
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={() => handleActionClick(action.path)}
                        FabProps={{
                            color: action.color,
                            size: 'small',
                        }}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
};
