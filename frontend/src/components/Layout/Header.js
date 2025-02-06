import React, { useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  Button,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { AnimatedHeading } from '../common/AnimatedComponents';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { ColorModeContext } from '../../theme/ThemeContext';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  backdropFilter: 'blur(8px)',
  backgroundColor: theme.palette.mode === 'light' 
    ? 'rgba(255, 250, 240, 0.85)'
    : 'rgba(28, 20, 17, 0.85)',
}));

const Logo = styled(motion(Box))(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  color: theme.palette.secondary.main,
  textDecoration: 'none',
  '& svg': {
    fontSize: '2.5rem',
  },
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: theme.palette.secondary.main,
  textDecoration: 'none',
  fontSize: '1.1rem',
  fontWeight: 500,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',
}));

const ThemeToggleButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  color: theme.palette.secondary.main,
  borderColor: theme.palette.secondary.main,
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
}));

const Header = () => {
  const { mode, toggleColorMode, isCompact, toggleCompactMode } = useContext(ColorModeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Logo
            component={Link}
            to="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                rotate: [0, 10, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              <RestaurantMenuIcon />
            </motion.div>
            <AnimatedHeading
              variant="h5"
              component="span"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Gourmet Haven
            </AnimatedHeading>
          </Logo>

          <NavContainer
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <NavLink to="/reservations">Reservations</NavLink>
            
            <ThemeToggleButton
              variant="outlined"
              startIcon={mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              onClick={toggleColorMode}
            >
              {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </ThemeToggleButton>

            <ThemeToggleButton
              variant="outlined"
              startIcon={isCompact ? <ViewAgendaIcon /> : <ViewCompactIcon />}
              onClick={toggleCompactMode}
            >
              {isCompact ? 'Regular View' : 'Compact View'}
            </ThemeToggleButton>

            <IconButton
              onClick={handleClick}
              color="inherit"
              sx={{ 
                ml: 2,
                backgroundColor: open ? 'rgba(0,0,0,0.1)' : 'transparent',
              }}
              aria-controls={open ? 'sections-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="sections-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'sections-button',
              }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 180,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1,
                  },
                },
              }}
            >
              <MenuItem onClick={handleClose} component={Link} to="/messages">
                <Typography variant="body1">Messages</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose} component={Link} to="/orders">
                <Typography variant="body1">Orders</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose} component={Link} to="/requests">
                <Typography variant="body1">Requests</Typography>
              </MenuItem>
            </Menu>
          </NavContainer>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header; 