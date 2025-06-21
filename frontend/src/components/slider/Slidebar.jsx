import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Avatar, Typography, Box, Button, Divider
} from '@mui/material';
import {
  Home, CreditCard, Send, ExpandLess, ExpandMore,
  Settings, LogoutRounded
} from '@mui/icons-material';

const menuItems = [
  {
    id: 'home', name: 'Trang chủ', path: '/', icon: <Home />
  },
  {
    id: 'account', name: 'Tài khoản & Thẻ', path: '/account', icon: <CreditCard />
  },
  {
    id: 'transfer', name: 'Chuyển tiền', path: '/transfer', icon: <Send />,
    hasSubmenu: true,
    submenu: [
      { name: 'Giữa các tài khoản của tôi', path: '/transfer/internal' },
      { name: 'Tới tài khoản khác', path: '/transfer/external' },
      { name: 'Theo lô', path: '/transfer/batch' },
      { name: 'Thanh toán hóa đơn', path: '/transfer/bills' }
    ]
  },
  {
    id: 'features', name: 'Tính năng khác', path: '/features', icon: <Settings />,
    hasSubmenu: true,
    submenu: [
      { name: 'Cài đặt', path: '/features/settings' }
    ]
  }
];

const Sidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState('');

  const handleToggle = (id) => {
    setOpenMenu(openMenu === id ? '' : id);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 280,
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: '#fff',
          boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
          borderRight: 'none',
          paddingTop: 2
        }
      }}
    >
      {/* Logo */}
      <Box textAlign="center" mb={1}>
        <img
          src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
          alt="Logo"
          style={{ height: 40, width: 240 }}
        />
      </Box>

      <Box display="flex" alignItems="center" px={2} py={1}>
        <Avatar sx={{ bgcolor: '#d70000', fontSize: 14, width: 42, height: 42 }}>
          VH
        </Avatar>
        <Box ml={2}>
          <Typography fontSize={14} fontWeight={600}>VU THIEN HUU</Typography>
          <Typography fontSize={12} color="text.secondary">Thông tin cá nhân</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItemButton
              onClick={() => item.hasSubmenu && handleToggle(item.id)}
              component={!item.hasSubmenu ? Link : 'button'}
              to={!item.hasSubmenu ? item.path : undefined}
              selected={isActive(item.path)}
              sx={{
                borderLeft: isActive(item.path) ? '4px solid #d70000' : '4px solid transparent',
                color: isActive(item.path) ? '#d70000' : '#333',
                backgroundColor: openMenu === item.id ? '#fef2f2' : 'transparent',
                minWidth:
                  item.id === 'transfer' ? 290 :
                  item.id === 'features' ? 290 :
                  'auto',
                '&:hover': {
                  backgroundColor: '#fef2f2',
                  color: '#d70000'
                }
              }}
            >

              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
              {item.hasSubmenu &&
                (openMenu === item.id ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            {item.hasSubmenu && (
              <Collapse in={openMenu === item.id} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {item.submenu.map((sub, idx) => (
                  <ListItemButton
                    key={idx}
                    component={Link}
                    to={sub.path}
                    selected={location.pathname === sub.path}
                    sx={{
                      pl: 7,
                      pr: 3,
                      py: 1.2,
                      mx: 1.5,
                      my: 0.5,
                      borderRadius: 1,
                      fontSize: 13.5,
                      color: location.pathname === sub.path ? '#d70000' : '#555',
                      backgroundColor: location.pathname === sub.path ? '#fff5f5' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#fef2f2',
                        color: '#d70000'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemText
                      primary={sub.name}
                      primaryTypographyProps={{ noWrap: true, fontWeight: 500 }}
                    />
                  </ListItemButton>

                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Box mt="auto" p={2} mb={1}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutRounded />}
          sx={{
            backgroundColor: '#d70000',
            '&:hover': {
              backgroundColor: '#b80000'
            },
            fontWeight: 'bold'
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
