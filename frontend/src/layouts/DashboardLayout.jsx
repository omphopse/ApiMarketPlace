import { AppBar, Avatar, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography, useMediaQuery, useTheme, Tooltip, Divider, ListSubheader, Badge } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../contexts/AuthContext';
import { navigationConfig } from '../routes/navigationConfig';
import { APP_NAME } from '../config/appConfig';

const EXPANDED_WIDTH = 220;
const COLLAPSED_WIDTH = 72;
const LOCAL_KEY = 'apihub:sidebarCollapsed';

const DashboardLayout = ({ children, role, title, subtitle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const val = localStorage.getItem(LOCAL_KEY);
    setCollapsed(val === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, collapsed ? 'true' : 'false');
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Build grouped navigation for improved hierarchy
  const groupedNav = () => {
    const items = navigationConfig[role] || [];
    if (role === 'ADMIN') {
      return [
        { title: 'Main', items: items.slice(0, 3) },
        { title: 'Management', items: items.slice(3, 7) },
        { title: 'System', items: items.slice(7) }
      ];
    }
    if (role === 'PROVIDER') {
      return [
        { title: 'Main', items: items.slice(0, 3) },
        { title: 'Account', items: items.slice(3) }
      ];
    }
    // CONSUMER
    return [
      { title: 'Main', items: items.slice(0, 2) },
      { title: 'Account', items: items.slice(2) }
    ];
  };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, height: 64 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{APP_NAME[0]}</Avatar>
        {!collapsed && (
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{APP_NAME}</Typography>
            <Typography variant="caption" color="text.secondary">Marketplace</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {groupedNav().map((group) => (
          <Box key={group.title} sx={{ px: collapsed ? 0.5 : 1.5, pb: 1 }}>
            {!collapsed && <ListSubheader disableSticky sx={{ bgcolor: 'transparent', color: 'text.secondary' }}>{group.title}</ListSubheader>}
            <List disablePadding>
              {group.items.map((item) => {
                const Icon = item.icon;
                const selected = location.pathname === item.path;
                const itemButton = (
                  <ListItemButton
                    key={item.path}
                    selected={selected}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 1.5,
                      mb: 0.5,
                      py: 1,
                      pl: collapsed ? 1 : 1.5,
                      pr: 2,
                      position: 'relative',
                      ...(selected ? { bgcolor: 'action.selected' } : {}),
                      transition: 'background-color 160ms linear'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: selected ? 'primary.main' : 'inherit' }}>
                      <Icon />
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />}
                    {selected && !collapsed && <Box sx={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, bgcolor: 'primary.main', borderRadius: '0 4px 4px 0' }} />}
                  </ListItemButton>
                );

                return collapsed ? <Tooltip key={item.path} title={item.label} placement="right"><Box>{itemButton}</Box></Tooltip> : itemButton;
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 1 }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: collapsed ? 'center' : 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>{(user?.name || 'U').charAt(0)}</Avatar>
            {!collapsed && (
              <Box>
                <Typography variant="body2" fontWeight={700}>{user?.name || 'User'}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.role || 'Member'}</Typography>
              </Box>
            )}
          </Box>
          <IconButton size="small" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  // derive breadcrumb from current location and navigationConfig
  const findLabelForPath = (path) => {
    const all = Object.values(navigationConfig).flat();
    const exact = all.find((i) => i.path === path);
    if (exact) return exact.label;
    // try prefix match
    const prefix = all.find((i) => path.startsWith(i.path));
    return prefix ? prefix.label : null;
  };

  const segments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  let acc = '';
  segments.forEach((seg) => {
    acc += `/${seg}`;
    const label = findLabelForPath(acc) || seg;
    breadcrumbs.push({ path: acc, label });
  });

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1, minHeight: 56 }}>
          {!isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <MenuIcon />
            </IconButton>
          )}
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1 }}>{breadcrumbs.length ? breadcrumbs.map(b => b.label).join(' / ') : title}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit" aria-label="Notifications">
              {user?.notifications?.unreadCount ? (
                <Badge badgeContent={user.notifications.unreadCount} color="error"><NotificationsIcon /></Badge>
              ) : (
                <NotificationsIcon />
              )}
            </IconButton>

            <Button onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ borderRadius: 999, textTransform: 'none' }}>
              <Avatar sx={{ width: 32, height: 32, mr: collapsed ? 0 : 1, bgcolor: 'primary.main' }}>{(user?.name || 'U').charAt(0)}</Avatar>
              {!collapsed && (
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={700}>{user?.name || 'User'}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.role || 'Member'}</Typography>
                </Box>
              )}
            </Button>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {/** show profile route if present for role */}
              {navigationConfig[role]?.find(i => i.label.toLowerCase().includes('profile')) && (
                <MenuItem component={Link} to={navigationConfig[role].find(i => i.label.toLowerCase().includes('profile')).path} onClick={() => setAnchorEl(null)}>Profile</MenuItem>
              )}
              {/** optional settings if exists */}
              {navigationConfig[role]?.find(i => i.label.toLowerCase().includes('settings')) && (
                <MenuItem component={Link} to={navigationConfig[role].find(i => i.label.toLowerCase().includes('settings')).path} onClick={() => setAnchorEl(null)}>Settings</MenuItem>
              )}
              <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Sign out</MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex' }}>
        {!isMobile && (
          <Box component="nav" sx={{ width: sidebarWidth, flexShrink: 0, transition: 'width 160ms ease' }}>
            <Box sx={{ position: 'sticky', top: 0, height: '100vh' }}>{drawer}</Box>
          </Box>
        )}

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Box sx={{ maxWidth: 1440, mx: 'auto' }}>{children}</Box>
        </Box>
      </Box>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}>
        <Box sx={{ width: EXPANDED_WIDTH }}>
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
