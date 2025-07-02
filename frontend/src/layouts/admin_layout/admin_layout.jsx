import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import {
  Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, AppBar, Typography, Divider, Avatar, IconButton, Badge, Menu, MenuItem
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import { styled } from '@mui/material/styles';

import { useNavigate } from 'react-router-dom';

const drawerWidth = 280;

// Custom styled components for professional design
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
  boxShadow: '0 4px 20px rgba(21, 101, 192, 0.25)',
  backdropFilter: 'blur(10px)',
  borderBottom: 'none',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
    color: '#37474f',
    borderRight: '1px solid #e0e0e0',
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: '6px 16px',
  borderRadius: '12px',
  padding: '14px 20px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1565c0, #42a5f5)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: -1,
  },
  '&:hover': {
    backgroundColor: 'rgba(21, 101, 192, 0.08)',
    transform: 'translateX(4px)',
    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
    '&::before': {
      transform: 'translateX(0)',
    },
    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
      color: '#ffffff',
      zIndex: 1,
    },
  },
  '&.Mui-selected': {
    backgroundColor: '#1565c0',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(21, 101, 192, 0.3)',
    '& .MuiListItemIcon-root': {
      color: '#ffffff',
    },
    '&:hover': {
      backgroundColor: '#0d47a1',
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 72,
  height: 72,
  margin: '24px auto 16px',
  border: '4px solid #ffffff',
  boxShadow: '0 8px 25px rgba(21, 101, 192, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 12px 35px rgba(21, 101, 192, 0.4)',
  },
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '24px 16px',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  margin: '16px',
  borderRadius: '16px',
  border: '1px solid #e1f5fe',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #1565c0, #42a5f5, #1565c0)',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: '32px',
  marginLeft: `${drawerWidth}px`,
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e3f2fd" fill-opacity="0.3"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    zIndex: 0,
  },
}));

const ContentCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  padding: '32px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(21, 101, 192, 0.1)',
  position: 'relative',
  zIndex: 1,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
  },
}));

const AdminLayout = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState('dashboard');
   const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

//   const menuItems = [
//     { label: 'Tổng Quan', icon: <DashboardIcon />, key: 'dashboard' },
//     { label: 'Khách Hàng', icon: <PeopleIcon />, key: 'users' },
//     { label: 'Báo Cáo', icon: <AssessmentIcon />, key: 'reports' },
//     { label: 'Bảo Mật', icon: <SecurityIcon />, key: 'security' },
//     { label: 'Cài Đặt', icon: <SettingsIcon />, key: 'settings' },
//   ];



    const menuItems = [
        {
        label: 'Overview',
        icon: <DashboardIcon />,
        key: 'dashboard',
        path: '/admin_new/admin_main',
        },
        {
        label: 'Client',
        icon: <PeopleIcon />,
        key: 'users',
        path: '/admin_new/admin_account',
        },
        {
        label: 'Request',
        icon: <PeopleIcon />,
        key: '  ',
        path: '/admin_new/admin_request',
        },
        
       
    ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top App Bar */}
      <StyledAppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccountBalanceIcon sx={{ mr: 2, fontSize: 32, color: '#ffffff' }} />
            <Typography 
              variant="h5" 
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                letterSpacing: 1.2,
                background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              TECHCOMBANK ADMIN
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" size="large">
              {/* <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge> */}
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ 
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Avatar
                src="https://randomuser.me/api/portraits/men/1.jpg"
                sx={{ width: 40, height: 40, border: '2px solid rgba(255, 255, 255, 0.3)' }}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountCircleIcon sx={{ mr: 2 }} />
          Personal profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2 }} />
          Account settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Sign out
        </MenuItem>
      </Menu>

      {/* Sidebar */}
      <StyledDrawer variant="permanent">
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {/* Admin Profile Section */}
          <ProfileSection>
            <StyledAvatar
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="Admin Avatar"
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                color: '#1565c0',
                mb: 0.5,
                fontSize: '1.1rem'
              }}
            >
              Nguyễn Văn Admin
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#546e7a',
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              System administrator
            </Typography>
            <Box
              sx={{
                mt: 2,
                px: 2,
                py: 1,
                backgroundColor: 'rgba(21, 101, 192, 0.1)',
                borderRadius: '20px',
                display: 'inline-block'
              }}
            >
              <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 600 }}>
                🟢 Online
              </Typography>
            </Box>
          </ProfileSection>

          <Box sx={{ px: 2, mt: 2 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#90a4ae', 
                fontWeight: 700,
                letterSpacing: 1,
                px: 2,
                display: 'block',
                mb: 1
              }}
            >
              MENU CHÍNH
            </Typography>
            <List sx={{ pt: 0 }}>
              {menuItems.map((item) => (
                <StyledListItemButton 
                  key={item.key}
                  selected={selectedItem === item.key}
                   onClick={() => {
                        setSelectedItem(item.key);
                        navigate(item.path);
                    }}
                >
                  <ListItemIcon sx={{ 
                    color: selectedItem === item.key ? '#ffffff' : '#1565c0', 
                    minWidth: 48,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ 
                      fontWeight: 600, 
                      fontSize: '0.95rem',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </StyledListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      </StyledDrawer>

      {/* Main Content */}
      <MainContent component="main">
        <Toolbar />
        <ContentCard>
          {  <Outlet /> || (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AccountBalanceIcon sx={{ fontSize: 80, color: '#1565c0', mb: 2, opacity: 0.7 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#37474f', mb: 2 }}>
                Chào mừng đến với VietcomBank Admin
              </Typography>
              <Typography variant="body1" sx={{ color: '#546e7a', maxWidth: 600, mx: 'auto' }}>
                Hệ thống quản trị ngân hàng hiện đại với giao diện thân thiện và tính năng mạnh mẽ. 
                Bắt đầu quản lý tài khoản và dịch vụ ngân hàng một cách hiệu quả.
              </Typography>
            </Box>
          )}
        </ContentCard>
      </MainContent>
    </Box>
  );
};

export default AdminLayout;