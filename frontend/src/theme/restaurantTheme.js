import { createTheme } from '@mui/material/styles';

const baseTheme = {
  typography: {
    fontFamily: "'Georgia', 'Playfair Display', serif",
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2.8rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h3: {
      fontSize: '2.2rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
      fontFamily: "'Georgia', serif",
    },
    body2: {
      fontFamily: "'Georgia', serif",
    },
    button: {
      textTransform: 'none',
      fontSize: '1.1rem',
      fontWeight: 500,
      fontFamily: "'Georgia', serif",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: '#D4AF37', // Gold
    light: '#E5C76B',
    dark: '#B38F1D',
  },
  secondary: {
    main: '#8B4513', // Saddle Brown
    light: '#A0522D',
    dark: '#733A0F',
  },
  background: {
    default: '#FFFAF0', // Floral White
    paper: '#FFF8DC', // Cornsilk
  },
  text: {
    primary: '#2C1810', // Dark Brown
    secondary: '#5C4033', // Light Brown
  },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#9C8032', // More muted gold for dark mode
    light: '#B39547',
    dark: '#7A6627',
  },
  secondary: {
    main: '#A67B5B', // Softer brown for dark mode
    light: '#BF9174',
    dark: '#8B6548',
  },
  background: {
    default: '#1C1411', // Very Dark Brown
    paper: '#2C1810', // Dark Brown
  },
  text: {
    primary: '#E6DCC6', // Softer off-white
    secondary: '#B39F83', // Muted tan
  },
  action: {
    hover: 'rgba(156, 128, 50, 0.12)', // Subtle gold hover effect
  },
};

export const getRestaurantTheme = (mode = 'light') => {
  return createTheme({
    ...baseTheme,
    palette: mode === 'light' ? lightPalette : darkPalette,
  });
};