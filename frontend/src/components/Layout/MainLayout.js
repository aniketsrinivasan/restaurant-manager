import React from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  paddingTop: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    padding: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    marginLeft: drawerWidth,
    padding: theme.spacing(3),
  }
}));

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <IconButton
            color="primary"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="text.primary">
            Restaurant Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar 
        drawerWidth={drawerWidth} 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />
      <Main>
        <Toolbar /> {/* Spacing for AppBar */}
        {children}
      </Main>
    </Box>
  );
};

export default MainLayout; 