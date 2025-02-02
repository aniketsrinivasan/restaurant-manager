import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Reservations', icon: <EventNoteIcon />, path: '/reservations' },
  { text: 'Tables', icon: <RestaurantIcon />, path: '/tables' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
];

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(144, 202, 249, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(144, 202, 249, 0.12)',
              },
              mb: 0.5,
              borderRadius: 1,
              mx: 1,
              width: 'auto',
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                minWidth: 40
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
              }}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const drawerStyle = {
    '& .MuiDrawer-paper': { 
      boxSizing: 'border-box', 
      width: drawerWidth,
      backgroundColor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider'
    },
  };

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={drawerStyle}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={drawerStyle}
          open
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar; 