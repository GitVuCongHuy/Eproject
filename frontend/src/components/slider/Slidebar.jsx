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

// --- Bảng màu Đen & Trắng ---
const primaryBlack = '#333';
const mediumGray = '#616161';
const lightGrayHover = '#f5f5f5'; // Màu nền khi hover
const darkGray = '#212121'; // Màu đậm hơn cho hover button

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
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

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
      <Box textAlign="center" mb={2}>
        <img
          src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
          alt="Logo"
          style={{ height: 40, width: 240 }} // Chuyển logo thành trắng đen
        />
      </Box>

      <Box display="flex" alignItems="center" px={2} py={1}> 
        <Avatar sx={{ fontSize: 14, width: 42, height: 42 }}>
          VH
        </Avatar>
        <Box ml={2}>
          <Typography fontSize={14} fontWeight={600}>{`VU THIEN HUU`}</Typography>
          <Typography fontSize={12} color="text.secondary">Thông tin cá nhân</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <List component="nav">
        {menuItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItemButton
              onClick={() => item.hasSubmenu && handleToggle(item.id)}
              component={!item.hasSubmenu ? Link : 'button'}
              to={!item.hasSubmenu ? item.path : undefined}
              sx={{
                borderLeft: isActive(item.path) ? `4px solid ${primaryBlack}` : '4px solid transparent',
                color: isActive(item.path) ? primaryBlack : mediumGray,
                backgroundColor: openMenu === item.id ? lightGrayHover : 'transparent',
                '&.Mui-selected': { // Style cho mục được chọn
                    backgroundColor: 'transparent',
                    color: primaryBlack,
                    '&:hover': {
                        backgroundColor: lightGrayHover,
                    },
                },
                minWidth:
                  item.id === 'transfer' ? 290 :
                  item.id === 'features' ? 290 :
                  'auto',
                '&:hover': {
                  backgroundColor: lightGrayHover,
                  color: primaryBlack
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
                        color: location.pathname === sub.path ? primaryBlack : mediumGray,
                        backgroundColor: location.pathname === sub.path ? lightGrayHover : 'transparent',
                        '&.Mui-selected': {
                            backgroundColor: lightGrayHover,
                            '&:hover': {
                                backgroundColor: lightGrayHover,
                            },
                        },
                        '&:hover': {
                          backgroundColor: lightGrayHover,
                          color: primaryBlack
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

      <Box mt="auto" p={2} mb={1} display="flex" justifyContent="center" >
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutRounded />}
          sx={{
            borderRadius: 5,
            backgroundColor: primaryBlack,
            '&:hover': {
              backgroundColor: darkGray,
            },
            fontWeight: 'bold',
            // py: 1.2
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;