import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { getRestaurantTheme } from './restaurantTheme';

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
  isCompact: false,
  toggleCompactMode: () => {},
});

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [isCompact, setIsCompact] = useState(false);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          console.log('Switching to:', newMode);
          return newMode;
        });
      },
      toggleCompactMode: () => {
        setIsCompact((prev) => !prev);
      },
      mode,
      isCompact,
    }),
    [mode, isCompact]
  );

  const theme = useMemo(() => getRestaurantTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}; 