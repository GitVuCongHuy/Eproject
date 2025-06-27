import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/context'; // Import useAuth
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Avatar, Typography, Box, Button, Divider
} from '@mui/material';
import {
  Home, CreditCard, Send, ExpandLess, ExpandMore,
  Settings, LogoutRounded
} from '@mui/icons-material';

// --- Bảng màu gốc của bạn ---
const primaryBlack = '#333';
const mediumGray = '#616161';
const lightGrayHover = '#f5f5f5';
const darkGray = '#212121';

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
      // { name: 'Tới tài khoản khác', path: '/transfer/external' },
      { name: 'Theo lô', path: '/transfer/batch' },
      { name: 'Thanh toán hóa đơn', path: '/transfer/bills' }
    ]
  },
  {
    id: 'features', name: 'Tính năng khác', path: '/features', icon: <Settings />,
    hasSubmenu: true,
    submenu: [
      { name: 'Cài đặt', path: '/features/settings' },
      { name: 'Yêu cầu sổ séc', path: '/chequebook'},
      { name: 'Hủy sổ séc', path: '/cancel'},
      { name: 'Sao kê', path: '/statement'}
    ]
  }
];

// Hàm helper để lấy chữ cái đầu của tên
const getInitials = (name = '') => {
  if (!name) return '';
  const nameParts = name.trim().split(' ');
  const lastName = nameParts[nameParts.length - 1];
  const firstName = nameParts[0];
  if (nameParts.length > 1) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};


const Sidebar = () => {
  const location = useLocation();
  const { getUserInfo, logout } = useAuth(); // Lấy hàm từ context
  const [user, setUser] = useState(null); // State để lưu thông tin user
  const [openMenu, setOpenMenu] = useState('');

  // useEffect để lấy thông tin user khi component được mount
  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUserInfo();
      if (result.success) {
        setUser(result.data);
      } else {
        console.error("Failed to fetch user info:", result.message);
        if (result.errorType === 'InvalidToken') {
          logout();
        }
      }
    };
    fetchUser();
  }, [getUserInfo, logout]);

  const handleToggle = (id) => setOpenMenu(openMenu === id ? '' : id);
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

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
          style={{ height: 40, width: 240 }} // << Đã xóa filter: grayscale(100%)
        />
      </Box>

      {/* Thông tin người dùng động */}
      <Box display="flex" alignItems="center" px={2} py={1}> 
        <Avatar sx={{ bgcolor: primaryBlack, fontSize: 14, width: 42, height: 42 }}>
          {user ? getInitials(user.full_name) : '...'}
        </Avatar>
        <Box ml={2}>
          <Typography fontSize={14} fontWeight={600}>
            {user ? user.full_name.toUpperCase() : 'Đang tải...'}
          </Typography>
          <Typography fontSize={12} color="text.secondary">Thông tin cá nhân</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Phần menu giữ nguyên style gốc của bạn */}
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
                '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: primaryBlack,
                    '&:hover': {
                        backgroundColor: lightGrayHover,
                    },
                },
                minWidth: item.id === 'transfer' || item.id === 'features' ? 290 : 'auto',
                '&:hover': {
                  backgroundColor: lightGrayHover,
                  color: primaryBlack
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
              {item.hasSubmenu && (openMenu === item.id ? <ExpandLess /> : <ExpandMore />)}
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
                        pl: 7, pr: 3, py: 1.2, mx: 1.5, my: 0.5, borderRadius: 1, fontSize: 13.5,
                        color: location.pathname === sub.path ? primaryBlack : mediumGray,
                        backgroundColor: location.pathname === sub.path ? lightGrayHover : 'transparent',
                        '&.Mui-selected': {
                            backgroundColor: lightGrayHover,
                            '&:hover': { backgroundColor: lightGrayHover },
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

      {/* Nút đăng xuất đã thêm onClick và giữ style gốc của bạn */}
      <Box mt="auto" p={2} mb={1}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutRounded />}
          onClick={logout} // << THÊM CHỨC NĂNG ĐĂNG XUẤT
          sx={{
            borderRadius: 5,
            backgroundColor: primaryBlack,
            '&:hover': {
              backgroundColor: darkGray,
            },
            fontWeight: 'bold',
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;