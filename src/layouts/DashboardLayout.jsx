import { AppBar, Avatar, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { navigationConfig } from '../routes/navigationConfig';
import { APP_NAME } from '../config/appConfig';

const drawerWidth = 260;

const DashboardLayout = ({ children, role, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#F7F9FC', borderRight: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{APP_NAME[0]}</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>{APP_NAME}</Typography>
          <Typography variant="caption" color="text.secondary">Marketplace Control Center</Typography>
        </Box>
      </Box>
      <List sx={{ px: 1.5 }}>
        {navigationConfig[role]?.map((item) => {
          const Icon = item.icon;
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><Icon color={selected ? 'primary' : 'inherit'} /></ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit" aria-label="Notifications"><NotificationsIcon /></IconButton>
            <Button onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ borderRadius: 999, textTransform: 'none' }}>
              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>{(user?.name || 'U').charAt(0)}</Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={700}>{user?.name || 'User'}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.role || 'Member'}</Typography>
              </Box>
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem component={Link} to="/" onClick={() => setAnchorEl(null)}>Home</MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Logout</MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box sx={{ display: 'flex' }}>
        {!isMobile && (
          <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0 }}>
            <Box sx={{ position: 'sticky', top: 0, height: '100vh' }}>{drawer}</Box>
          </Box>
        )}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Box sx={{ maxWidth: 1440, mx: 'auto' }}>{children}</Box>
        </Box>
      </Box>
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}>
        <Box sx={{ width: drawerWidth }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setMobileOpen(false)} aria-label="Close navigation"><CloseIcon /></IconButton>
          </Box>
          {drawer}
        </Box>
      </Drawer>
    </Box>
  );
};

export default DashboardLayout;
