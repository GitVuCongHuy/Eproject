import React from 'react';
import {
  Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, AppBar, Typography, Divider, Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { styled } from '@mui/material/styles';

const drawerWidth = 260;

// Custom styled components for enhanced visuals
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e88e5, #4fc3f7)',
  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  borderBottom: '2px solid #bbdefb',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: 'linear-gradient(180deg, #ffffff, #f1f4f9)',
    color: '#263238',
    borderRight: '2px solid #bbdefb',
    boxShadow: '3px 0 10px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: '10px 16px',
  borderRadius: '12px',
  padding: '12px 20px',
  border: '1px solid #e3f2fd',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #e1f5fe, #b3e5fc)',
    transform: 'translateX(6px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    borderColor: '#4fc3f7',
  },
  '&.Mui-selected': {
    background: 'linear-gradient(135deg, #0288d1, #4fc3f7)',
    color: '#ffffff',
    borderColor: '#0277bd',
    '& .MuiListItemIcon-root': {
      color: '#ffffff',
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  margin: '20px auto',
  border: '3px solid #4fc3f7',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    borderColor: '#0288d1',
  },
}));

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', backgroundColor: '#e8ecef' }}>
      <CssBaseline />

      {/* Top App Bar */}
      <StyledAppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 2, fontSize: 36, color: '#ffffff' }} />
          <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            VIETCOMBANK ADMIM
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Sidebar */}
      <StyledDrawer variant="permanent">
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          {/* Admin Profile */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <StyledAvatar
              src="https://randomuser.me/api/portraits/men/1.jpg" // Placeholder admin image
              alt="Admin Avatar"
            />
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600, color: '#01579b' }}>
              Admin Name
            </Typography>
            <Typography variant="caption" sx={{ color: '#546e7a' }}>
              System Administrator
            </Typography>
          </Box>
          <Divider sx={{ mb: 2, bgcolor: '#bbdefb' }} />
          <List>
            {[
              { label: 'Tổng Quan', icon: <DashboardIcon />, key: 'dashboard' },
              { label: 'Khách Hàng', icon: <PeopleIcon />, key: 'users' },
              { label: 'Báo Cáo', icon: <AssessmentIcon />, key: 'reports' },
              { label: 'Cài Đặt', icon: <SettingsIcon />, key: 'settings' },
            ].map((item) => (
              <StyledListItemButton key={item.key}>
                <ListItemIcon sx={{ color: '#01579b', minWidth: 44 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '1.1rem' }}
                />
              </StyledListItemButton>
            ))}
          </List>
        </Box>
      </StyledDrawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          ml: `${drawerWidth}px`,
          minHeight: '100vh',
          backgroundColor: '#e8ecef',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            p: 4,
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
            border: '1px solid #bbdefb',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;