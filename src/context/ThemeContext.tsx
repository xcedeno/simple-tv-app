import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';

type ColorModeContextType = {
    toggleColorMode: () => void;
    mode: PaletteMode;
};

const ColorModeContext = createContext<ColorModeContextType>({ toggleColorMode: () => { }, mode: 'light' });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }: { children: React.ReactNode }) => {
    // Try to get initial mode from localStorage, default to 'light'
    const [mode, setMode] = useState<PaletteMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode,
        }),
        [mode],
    );

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // Light Mode Palette
                    primary: {
                        main: '#2563eb', // Vivid Blue
                    },
                    secondary: {
                        main: '#eff6ff', // Very light blue
                    },
                    background: {
                        default: '#f3f4f6', // Clean light grey
                        paper: '#ffffff',
                    },
                    text: {
                        primary: '#111827',
                        secondary: '#4b5563',
                    },
                }
                : {
                    // Dark Mode Palette
                    primary: {
                        main: '#60a5fa', // Lighter Blue for dark bg
                    },
                    secondary: {
                        main: '#1e3a8a',
                    },
                    background: {
                        default: '#0f172a', // Deep Navy/Black
                        paper: '#1e293b', // Slate
                    },
                    text: {
                        primary: '#f9fafb',
                        secondary: '#9ca3af',
                    },
                }),
        },
        components: {
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        borderRight: 'none', // Remove default border for cleaner look
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        boxShadow: 'none',
                    },
                },
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 700 },
            h2: { fontWeight: 600 },
            h3: { fontWeight: 600 },
            h4: { fontWeight: 600 },
            poster: {
                fontSize: '4rem',
                color: 'red',
            }, // Example custom variant if needed later, ignoring for now
        },
    } as any), [mode]); // Cast to any to avoid strict TS issues with custom variants if user adds them

    return (
        <ColorModeContext.Provider value={colorMode}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ColorModeContext.Provider>
    );
};
