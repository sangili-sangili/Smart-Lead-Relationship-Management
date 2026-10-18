import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as LeadsIcon,
  Business as CompaniesIcon,
  CheckCircleOutline as TasksIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  NotificationsNone as NotificationsIcon
} from '@mui/icons-material';
import { ROUTES } from '../constants/routes';
import { COLOR_PALETTE } from '../constants/statusColors';

const DRAWER_WIDTH = 250;

const navItems = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
  { label: 'Leads', path: ROUTES.LEADS, icon: <LeadsIcon /> },
  { label: 'Companies', path: ROUTES.COMPANIES, icon: <CompaniesIcon /> },
  { label: 'Tasks', path: ROUTES.TASKS, icon: <TasksIcon /> }
];

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('leadflow_user') || '{"name":"John Doe","role":"Admin"}');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('leadflow_token');
    localStorage.removeItem('leadflow_user');
    handleMenuClose();
    navigate(ROUTES.LOGIN);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: COLOR_PALETTE.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem'
          }}
        >
          LF
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: COLOR_PALETTE.textPrimary, lineHeight: 1.2 }}>
            Mini CRM
          </Typography>
          <Typography variant="caption" sx={{ color: COLOR_PALETTE.textSecondary, fontSize: '0.72rem' }}>
            LeadFlow Suite
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: COLOR_PALETTE.border }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  bgcolor: isActive ? COLOR_PALETTE.primary : 'transparent',
                  color: isActive ? '#FFFFFF' : COLOR_PALETTE.textSecondary,
                  '&:hover': {
                    bgcolor: isActive ? COLOR_PALETTE.primaryHover : 'rgba(99, 102, 241, 0.08)',
                    color: isActive ? '#FFFFFF' : COLOR_PALETTE.primary
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? '#FFFFFF' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: COLOR_PALETTE.border }} />

      {/* Bottom User Profile */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: COLOR_PALETTE.primary, width: 36, height: 36, fontSize: '0.9rem' }}>
          {user.name ? user.name.charAt(0) : 'U'}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: COLOR_PALETTE.textPrimary, noWrap: true }}>
            {user.name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: COLOR_PALETTE.textSecondary, display: 'block' }}>
            {user.role || 'Sales Rep'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleLogout} title="Logout" sx={{ color: COLOR_PALETTE.textSecondary }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLOR_PALETTE.background }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: '#FFFFFF',
          borderBottom: `1px solid ${COLOR_PALETTE.border}`,
          color: COLOR_PALETTE.textPrimary
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Global Search Placeholder */}
            <Paper
              elevation={0}
              sx={{
                p: '2px 8px',
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                width: 280,
                borderRadius: 2,
                border: `1px solid ${COLOR_PALETTE.border}`,
                bgcolor: '#F8FAFC'
              }}
            >
              <SearchIcon sx={{ color: COLOR_PALETTE.textSecondary, fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder="Search anything..."
                inputProps={{ 'aria-label': 'search crm' }}
                sx={{ fontSize: '0.85rem', flex: 1 }}
              />
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton sx={{ color: COLOR_PALETTE.textSecondary }}>
              <NotificationsIcon />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: COLOR_PALETTE.primary, width: 34, height: 34, fontSize: '0.85rem' }}>
                {user.name ? user.name.charAt(0) : 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: COLOR_PALETTE.textSecondary }}>
                  {user.role || 'Admin'}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Persistent Sidebar Navigation */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile temporary drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: `1px solid ${COLOR_PALETTE.border}` }
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: `1px solid ${COLOR_PALETTE.border}` }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
