import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // << THÊM useNavigate
import { useAuth } from '../../context/Context';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse,
  Avatar, Typography, Box, Button, Divider, Chip
} from '@mui/material';
import {
  Home, CreditCard, Send, ExpandLess, ExpandMore,
  Settings, LogoutRounded, ChevronRight
} from '@mui/icons-material';

// --- Bảng màu hiện đại phù hợp với Techcombank ---
const colors = {
  primary: '#e53e3e',
  primaryDark: '#c53030',
  secondary: '#f8f9fa',
  text: {
    primary: '#2d3748',
    secondary: '#718096',
    light: '#adb5bd'
  },
  background: {
    main: '#ffffff',
    hover: '#f8f9fa',
    active: '#feb2b2',
    gradient: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
  },
  border: '#e2e8f0',
  shadow: '0 2px 10px rgba(0,0,0,0.08)'
};

const menuItems = [
  {
    id: 'home', 
    name: 'Trang chủ', 
    path: '/', 
    icon: <Home />,
    badge: null
  },
  {
    id: 'account', 
    name: 'Tài khoản', 
    path: '/account', 
    icon: <CreditCard />,
    badge: null
  },
  {
    id: 'transfer', 
    name: 'Dịch vụ khác', 
    path: '/transfer', 
    icon: <Send />,
    hasSubmenu: true,
    badge: 'Mới',
    submenu: [
      { name: 'Chuyển tiền', path: '/transfer/internal', icon: '💸' },
      { name: 'Yêu cầu thay đổi thông tin', path: '/update-info', icon: '📝' },
      { name: 'Yêu cầu cấp sổ séc', path: '/chequebook', icon: '📒' },
      { name: 'Hủy séc', path: '/cancel', icon: '🚫' },
      { name: 'Sao kê giao dịch', path: '/statement', icon: '📊' },
    ]
  },
  {
    id: 'features', 
    name: 'Tính năng khác', 
    path: '/features', 
    icon: <Settings />,
    hasSubmenu: true,
    badge: null,
    submenu: [
      // { name: 'Cài đặt', path: '/settings', icon: '⚙️' },
      { name: 'Hướng dẫn', path: '/guide', icon: '❓' },
    ]
  }
];

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
  const navigate = useNavigate(); // << KHỞI TẠO useNavigate
  const { getUserInfo, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const result = await getUserInfo();
      if (result.success) {
        setUser(result.data);
      } else {
        console.error("Failed to fetch user info:", result.message);
        if (result.errorType === 'InvalidToken') {
          logout();
          navigate('/login', { replace: true }); // << CHUYỂN HƯỚNG KHI TOKEN KHÔNG HỢP LỆ
        }
      }
    };
    fetchUser();
  }, [getUserInfo, logout, navigate]); // << THÊM navigate VÀO DEPENDENCY ARRAY

  const handleToggle = (id) => setOpenMenu(openMenu === id ? '' : id);
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  // << HÀM XỬ LÝ ĐĂNG XUẤT MỚI
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context (hàm này sẽ xóa token)
    navigate('/login', { replace: true }); // Chuyển hướng về trang đăng nhập và thay thế lịch sử
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 300,
        '& .MuiDrawer-paper': {
          width: 300,
          backgroundColor: colors.background.main,
          boxShadow: colors.shadow,
          borderRight: `1px solid ${colors.border}`,
          paddingTop: 0,
          background: `linear-gradient(180deg, ${colors.background.main} 0%, #fafbfc 100%)`
        }
      }}
    >
      {/* Header với gradient */}
      <Box 
        sx={{
          background: colors.background.gradient,
          padding: '24px 20px',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255,255,255,0.2)'
          }
        }}
      >
        {/* Logo */}
        <Box textAlign="center" mb={3}>
          <Box
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '12px',
              display: 'inline-block',
              backdropFilter: 'blur(10px)'
            }}
          >
            <img
              src="https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg"
              alt="Logo"
              style={{ 
                height: 32, 
                width: 200,
                filter: 'brightness(0 ) invert(1)'
              }}
            />
          </Box>
        </Box>

        {/* Thông tin người dùng */}
        <Box 
          display="flex" 
          alignItems="center" 
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        > 
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
              fontSize: 16, 
              width: 48, 
              height: 48,
              fontWeight: 'bold',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {user ? getInitials(user.full_name) : '...'}
          </Avatar>
          <Box ml={2} flex={1}>
            <Typography 
              fontSize={15} 
              fontWeight={600}
              color="white"
              sx={{ 
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                marginBottom: '2px'
              }}
            >
              {user ? user.full_name : 'Đang tải...'}
            </Typography>
            <Typography 
              fontSize={12} 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Khách hàng VIP
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu */}
      <Box sx={{ padding: '16px 12px', flex: 1 }}>
        <List component="nav" sx={{ padding: 0 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItemButton
                onClick={() => item.hasSubmenu && handleToggle(item.id)}
                component={!item.hasSubmenu ? Link : 'button'}
                to={!item.hasSubmenu ? item.path : undefined}
                sx={{
                  borderRadius: '12px',
                  margin: '4px 0',
                  padding: '12px 16px',
                  minHeight: '48px',
                  backgroundColor: isActive(item.path) ? colors.background.active : 'transparent',
                  color: isActive(item.path) ? colors.primary : colors.text.secondary,
                  border: isActive(item.path) ? `1px solid ${colors.primary}20` : '1px solid transparent',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: isActive(item.path) ? '4px' : '0px',
                    backgroundColor: colors.primary,
                    transition: 'width 0.3s ease',
                    borderRadius: '0 4px 4px 0'
                  },
                  '&:hover': {
                    backgroundColor: colors.background.hover,
                    color: colors.text.primary,
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit',
                    minWidth: '40px',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 500,
                    fontSize: '14px'
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: '20px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: colors.primary,
                      color: 'white',
                      marginRight: '8px'
                    }}
                  />
                )}
                {item.hasSubmenu && (
                  <Box
                    sx={{
                      transition: 'transform 0.3s ease',
                      transform: openMenu === item.id ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                  >
                    <ChevronRight fontSize="small" />
                  </Box>
                )}
              </ListItemButton>

              {item.hasSubmenu && (
                <Collapse in={openMenu === item.id} timeout={300}>
                  <Box sx={{ padding: '0 8px', marginBottom: '8px' }}>
                    {item.submenu.map((sub, idx) => (
                      <ListItemButton
                        key={idx}
                        component={Link}
                        to={sub.path}
                        sx={{
                          borderRadius: '8px',
                          margin: '2px 0',
                          padding: '8px 16px 8px 48px',
                          minHeight: '40px',
                          color: location.pathname === sub.path ? colors.primary : colors.text.light,
                          backgroundColor: location.pathname === sub.path ? colors.background.active : 'transparent',
                          fontSize: '13px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: colors.background.hover,
                            color: colors.text.primary,
                            paddingLeft: '52px'
                          }
                        }}
                      >
                        <Box component="span" sx={{ marginRight: '12px', fontSize: '14px' }}>
                          {sub.icon}
                        </Box>
                        <ListItemText
                          primary={sub.name}
                          primaryTypographyProps={{ 
                            fontSize: '13px',
                            fontWeight: location.pathname === sub.path ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </Box>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Nút đăng xuất */}
      <Box sx={{ padding: '16px 20px 24px' }}>
        <Divider sx={{ marginBottom: '16px', borderColor: colors.border }} />
        <Button
          variant="contained"
          fullWidth
          startIcon={<LogoutRounded />}
          onClick={handleLogout} // << GỌI HÀM handleLogout
          sx={{
            borderRadius: '12px',
            padding: '12px 16px',
            backgroundColor: colors.text.secondary,
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: colors.text.primary,
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
            }
          }}
        >
          Đăng xuất
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
