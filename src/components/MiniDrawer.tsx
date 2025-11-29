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
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RouterIcon from '@mui/icons-material/Router';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from '@mui/material';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: '#1a237e', // Primary color from App.tsx
    color: '#ffffff',
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
    backgroundColor: '#1a237e', // Primary color from App.tsx
    color: '#ffffff',
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
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
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && !isMobile && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
        ...(!open && isMobile && {
            // On mobile, when closed, we don't want the closedMixin (mini strip). 
            // We want it to be hidden (handled by variant="temporary"), so we avoid setting width.
            // However, to be safe, we can set width to 0 or rely on MUI.
            // MUI temporary drawer handles visibility via transform.
        }),
    }),
);

export default function MiniDrawer({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(!isMobile); // Default open on desktop, closed on mobile
    const [openGestor, setOpenGestor] = useState(true);
    const location = useLocation();

    // Update open state when screen size changes
    React.useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleGestorClick = () => {
        if (!open) {
            setOpen(true);
            setOpenGestor(true);
        } else {
            setOpenGestor(!openGestor);
        }
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Formulario', icon: <AddCircleOutlineIcon />, path: '/form' },
        { text: 'Lista', icon: <ListAltIcon />, path: '/list' },
        { text: 'Tarjetas', icon: <CreditCardIcon />, path: '/cards' },
        { text: 'Reportes', icon: <AssessmentIcon />, path: '/reports' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={open}
                isMobile={isMobile}
                onClose={isMobile ? handleDrawerClose : undefined}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    '& .MuiDrawer-paper': {
                        // width: drawerWidth, // We handle width in styled component now
                        ...(isMobile && {
                            width: drawerWidth, // Always full width on mobile when open
                            // position: 'fixed', // MUI temporary drawer is already fixed
                        }),
                    }
                }}
            >
                <DrawerHeader>
                    {open ? (
                        <IconButton onClick={handleDrawerClose} sx={{ color: 'white' }}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    ) : (
                        <IconButton onClick={handleDrawerOpen} sx={{ color: 'white', ml: 0.5 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                </DrawerHeader>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                <List>
                    {/* Gestor de Cuentas Item */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            onClick={handleGestorClick}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}
                            >
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Gestor de Cuentas" sx={{ opacity: open ? 1 : 0 }} />
                            {open ? (openGestor ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItemButton>
                    </ListItem>

                    {/* Sub Items */}
                    <Collapse in={open && openGestor} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {menuItems.map((item) => (
                                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                    <Tooltip title={!open ? item.text : ""} placement="right">
                                        <ListItemButton
                                            component={Link}
                                            to={item.path}
                                            onClick={isMobile ? handleDrawerClose : undefined} // Close drawer on navigation on mobile
                                            sx={{
                                                minHeight: 48,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2.5,
                                                pl: open ? 4 : 2.5, // Indent if open
                                                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                }
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                    color: 'white'
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>

                    {/* Gestión de Equipos Item */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <Tooltip title={!open ? "Gestión de Equipos" : ""} placement="right">
                            <ListItemButton
                                component={Link}
                                to="/equipment"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    backgroundColor: location.pathname === '/equipment' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    <RouterIcon />
                                </ListItemIcon>
                                <ListItemText primary="Gestión de Equipos" sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>

                    {/* Soporte Técnico Item */}
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <Tooltip title={!open ? "Soporte Técnico" : ""} placement="right">
                            <ListItemButton
                                component={Link}
                                to="/support"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    backgroundColor: location.pathname === '/support' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    <SupportAgentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Soporte Técnico" sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>


                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5', width: '100%' }}>
                {children}
            </Box>
        </Box>
    );
}
