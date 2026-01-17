import React, { useState } from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RouterIcon from '@mui/icons-material/Router';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip, Typography } from '@mui/material';
import { useColorMode } from '../context/ThemeContext';

const drawerWidth = 260; // Slightly wider for better breathing room

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    borderRight: 'none',
    boxShadow: theme.palette.mode === 'dark'
        ? '5px 0 15px rgba(0,0,0,0.5)'
        : '5px 0 15px rgba(0,0,0,0.05)',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
    borderRight: 'none',
    boxShadow: theme.palette.mode === 'dark'
        ? '5px 0 15px rgba(0,0,0,0.5)'
        : '5px 0 15px rgba(0,0,0,0.05)',
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed to space-between to accommodate logo/text if added
    padding: theme.spacing(0, 2),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' })<{ open?: boolean; isMobile?: boolean }>(
    ({ theme, open, isMobile }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': {
                ...openedMixin(theme),
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
                // Optional: Add a subtle gradient or pattern in dark mode
                ...(theme.palette.mode === 'dark' && {
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
                }),
            },
        }),
        ...(!open && !isMobile && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': {
                ...closedMixin(theme),
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#ffffff',
            },
        }),
    }),
);

export default function MiniDrawer({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const { toggleColorMode, mode } = useColorMode();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(!isMobile);
    const [openGestor, setOpenGestor] = useState(false);
    const [openEquipement, setOpenEquipment] = useState(false);
    const [openSupport, setOpenSupport] = useState(false);
    const location = useLocation();

    React.useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    const handleGestorClick = () => {
        if (!open) {
            setOpen(true);
            setOpenGestor(true);
            setOpenEquipment(false);
            setOpenSupport(false);
        } else {
            setOpenGestor(!openGestor);
            if (!openGestor) {
                setOpenEquipment(false);
                setOpenSupport(false);
            }
        }
    };

    const handleEquipmentClick = () => {
        if (!open) {
            setOpen(true);
            setOpenEquipment(true);
            setOpenGestor(false);
            setOpenSupport(false);
        } else {
            setOpenEquipment(!openEquipement);
            if (!openEquipement) {
                setOpenGestor(false);
                setOpenSupport(false);
            }
        }
    };

    const handleSupportClick = () => {
        if (!open) {
            setOpen(true);
            setOpenSupport(true);
            setOpenGestor(false);
            setOpenEquipment(false);
        } else {
            setOpenSupport(!openSupport);
            if (!openSupport) {
                setOpenGestor(false);
                setOpenEquipment(false);
            }
        }
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Formulario', icon: <AddCircleOutlineIcon />, path: '/form' },
        { text: 'Lista', icon: <ListAltIcon />, path: '/list' },
        { text: 'Tarjetas', icon: <CreditCardIcon />, path: '/cards' },
        { text: 'Reportes', icon: <AssessmentIcon />, path: '/reports' },
    ];

    // Helper to determine if an item is active
    const isActive = (path: string) => location.pathname === path;

    // Common ListItemButton styling
    const getListItemStyles = (active: boolean) => ({
        minHeight: 48,
        justifyContent: open ? 'initial' : 'center',
        px: 2.5,
        my: 0.5, // Add vertical spacing
        mx: 1,   // Add horizontal spacing for "floating" look
        borderRadius: 2,
        transition: 'all 0.2s',
        position: 'relative',
        color: active ? theme.palette.primary.main : theme.palette.text.primary,
        backgroundColor: active
            ? (theme.palette.mode === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.08)')
            : 'transparent',
        '&:hover': {
            backgroundColor: active
                ? (theme.palette.mode === 'dark' ? 'rgba(96, 165, 250, 0.25)' : 'rgba(37, 99, 235, 0.15)')
                : theme.palette.action.hover,
            transform: 'translateX(3px)',
        },
        // Active indicator strip
        ...(active && {
            '&::before': {
                content: '""',
                position: 'absolute',
                left: -8, // Outside the border radius
                top: '50%',
                transform: 'translateY(-50%)',
                height: '60%',
                width: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: '0 4px 4px 0',
                display: open ? 'block' : 'none',
            }
        })
    });

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={open}
                isMobile={isMobile}
                onClose={isMobile ? handleDrawerClose : undefined}
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: isMobile ? drawerWidth : undefined,
                    }
                }}
            >
                <DrawerHeader>
                    {open && (
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', ml: 1, opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}>
                            Simple TV
                        </Typography>
                    )}
                    <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
                        {/* Toggle Icon logic or just Menu/Chevron? Keeping original logic but improved */}
                        {open ? (theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />) : <MenuIcon />}
                    </IconButton>
                </DrawerHeader>

                <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />

                <List>
                    {/* Theme Toggle Item - Prominent */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <Tooltip title={open ? "Cambiar Tema" : (mode === 'dark' ? "Modo Claro" : "Modo Oscuro")} placement="right">
                            <ListItemButton
                                onClick={toggleColorMode}
                                sx={{
                                    ...getListItemStyles(false),
                                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: theme.palette.text.secondary
                                    }}
                                >
                                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                                </ListItemIcon>
                                <ListItemText primary={mode === 'dark' ? "Modo Claro" : "Modo Oscuro"} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>

                    <Divider sx={{ my: 1, borderColor: theme.palette.divider }} />

                    {/* Gestor de Cuentas */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton onClick={handleGestorClick} sx={getListItemStyles(openGestor)}>
                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: openGestor ? theme.palette.primary.main : theme.palette.text.secondary }}>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Gestor de Cuentas" sx={{ opacity: open ? 1 : 0 }} />
                            {open ? (openGestor ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItemButton>
                    </ListItem>

                    <Collapse in={open && openGestor} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {menuItems.map((item) => (
                                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                    <Tooltip title={!open ? item.text : ""} placement="right">
                                        <ListItemButton
                                            component={Link}
                                            to={item.path}
                                            onClick={isMobile ? handleDrawerClose : undefined}
                                            sx={{
                                                ...getListItemStyles(isActive(item.path)),
                                                pl: open ? 4 : 2.5, // Reduced indent nesting visual for cleaner look
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>

                    {/* Gestión de Equipos */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton onClick={handleEquipmentClick} sx={getListItemStyles(openEquipement)}>
                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: openEquipement ? theme.palette.primary.main : theme.palette.text.secondary }}>
                                <RouterIcon />
                            </ListItemIcon>
                            <ListItemText primary="Gestión de Equipos" sx={{ opacity: open ? 1 : 0 }} />
                            {open ? (openEquipement ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItemButton>
                    </ListItem>

                    <Collapse in={open && openEquipement} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {/* Subitems for Equipment */}
                            {[
                                { text: 'Ver Equipos', path: '/equipment', icon: <RouterIcon /> },
                                { text: 'Inventario', path: '/inventory', icon: <ListAltIcon /> }
                            ].map((item) => (
                                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                    <Tooltip title={!open ? item.text : ""} placement="right">
                                        <ListItemButton
                                            component={Link}
                                            to={item.path}
                                            onClick={isMobile ? handleDrawerClose : undefined}
                                            sx={{
                                                ...getListItemStyles(isActive(item.path)),
                                                pl: open ? 4 : 2.5,
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>

                    {/* Soporte Técnico */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton onClick={handleSupportClick} sx={getListItemStyles(openSupport)}>
                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: openSupport ? theme.palette.primary.main : theme.palette.text.secondary }}>
                                <SupportAgentIcon />
                            </ListItemIcon>
                            <ListItemText primary="Soporte_Técnico" sx={{ opacity: open ? 1 : 0 }} />
                            {open ? (openSupport ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItemButton>
                    </ListItem>

                    <Collapse in={open && openSupport} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {[
                                { text: 'Dashboard', path: '/support/dashboard', icon: <DashboardIcon /> },
                                { text: 'Tablero Kanban', path: '/support/kanban', icon: <AssignmentIcon /> }
                            ].map((item) => (
                                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                    <Tooltip title={!open ? item.text : ""} placement="right">
                                        <ListItemButton
                                            component={Link}
                                            to={item.path}
                                            onClick={isMobile ? handleDrawerClose : undefined}
                                            sx={{
                                                ...getListItemStyles(isActive(item.path)),
                                                pl: open ? 4 : 2.5,
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>

                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, maxWidth: '100%', overflowX: 'auto', backgroundColor: theme.palette.background.default, minHeight: '100vh', transition: 'background-color 0.3s' }}>
                {isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={handleDrawerOpen}
                            edge="start"
                            sx={{ mr: 2, ...(open && { display: 'none' }) }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>
                )}
                {children}
            </Box>
        </Box>
    );
}
