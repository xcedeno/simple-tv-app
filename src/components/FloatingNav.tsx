import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Fab, Tooltip, Backdrop, Typography } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import RouterIcon from '@mui/icons-material/Router';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CloseIcon from '@mui/icons-material/Close';

export const FloatingNav: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Define the hierarchy
    const categories = [
        {
            id: 'accounts',
            name: 'Gestor de Cuentas',
            icon: <AccountCircleIcon />,
            color: 'primary' as const,
            actions: [
                { icon: <AddCircleOutlineIcon />, name: 'Formulario', path: '/form', color: 'primary' as const },
                { icon: <ListAltIcon />, name: 'Lista', path: '/list', color: 'secondary' as const },
                { icon: <CreditCardIcon />, name: 'Tarjetas', path: '/cards', color: 'warning' as const },
                { icon: <AssessmentIcon />, name: 'Reportes', path: '/reports', color: 'success' as const },
            ]
        },
        {
            id: 'equipment',
            name: 'Equipos',
            icon: <RouterIcon />,
            color: 'info' as const,
            actions: [
                { icon: <RouterIcon />, name: 'Ver Equipos', path: '/equipment', color: 'info' as const },
                { icon: <ListAltIcon />, name: 'Inventario', path: '/inventory', color: 'primary' as const },
            ]
        },
        {
            id: 'support',
            name: 'Soporte',
            icon: <SupportAgentIcon />,
            color: 'error' as const,
            actions: [
                { icon: <SupportAgentIcon />, name: 'Ver Soporte', path: '/support', color: 'error' as const },
            ]
        }
    ];

    const handleActionClick = (path: string) => {
        navigate(path);
        setOpen(false);
        setActiveCategory(null); // Reset on navigation
    };

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
    };

    const handleBackClick = () => {
        setActiveCategory(null);
    };

    // Get current actions based on state
    const currentActions = activeCategory
        ? [
            { icon: <ArrowBackIcon />, name: 'Volver', action: handleBackClick, color: 'default' as const },
            ...(categories.find(c => c.id === activeCategory)?.actions.map(a => ({ ...a, action: () => handleActionClick(a.path) })) || [])
        ]
        : categories.map(c => ({
            icon: c.icon,
            name: c.name,
            action: () => handleCategoryClick(c.id),
            color: c.color
        }));

    if (!isMobile) {
        // Desktop: Show expanded list (Flat for now, or could be grouped)
        // For desktop, we keep the flat list of main actions for quick access
        const desktopActions = [
            ...categories[0].actions, // Accounts
            ...categories[1].actions, // Equipment
            ...categories[2].actions  // Support
        ];

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
                {desktopActions.map((action) => (
                    <Tooltip key={action.name} title={action.name} arrow>
                        <Fab
                            component={Link}
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

    // Mobile: Custom "SpeedDial" with labels below icons
    return (
        <>
            <Backdrop open={open} onClick={() => setOpen(false)} sx={{ zIndex: 1300 }} />
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none' // Allow clicks to pass through wrapper
                }}
            >
                {/* Actions List */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column-reverse', // Bottom items are first in DOM (closest to main button)
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                        visibility: open ? 'visible' : 'hidden',
                        opacity: open ? 1 : 0,
                        transition: 'opacity 0.3s, transform 0.3s',
                        transform: open ? 'translateY(0)' : 'translateY(20px)',
                        pointerEvents: 'auto' // Re-enable clicks for actions
                    }}
                >
                    {currentActions.map((action) => (
                        <Box key={action.name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Fab
                                size="small"
                                color={action.color === 'default' ? undefined : action.color}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    action.action();
                                }}
                                sx={{ boxShadow: 3 }}
                            >
                                {action.icon}
                            </Fab>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'white',
                                    mt: 0.5,
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                    px: 1,
                                    py: 0.2,
                                    borderRadius: 4,
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {action.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Main Button */}
                <Fab
                    color="primary"
                    aria-label="Navegación"
                    onClick={() => {
                        if (open) {
                            setOpen(false);
                            setActiveCategory(null);
                        } else {
                            setOpen(true);
                        }
                    }}
                    sx={{ pointerEvents: 'auto', boxShadow: 4 }}
                >
                    {open ? <CloseIcon /> : <EditIcon />}
                </Fab>
            </Box>
        </>
    );
};
