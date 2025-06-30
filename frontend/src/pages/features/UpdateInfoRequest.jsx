import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  useTheme, GlobalStyles, CircularProgress, Alert, Stack, Divider,
  Snackbar, Container, Fade, Grow, IconButton, InputAdornment,
  Paper, Avatar, Chip
} from '@mui/material';
import {
  Person, Email, Phone, Lock, CheckCircle, Info, ArrowBack,
  Visibility, VisibilityOff, Edit, Security, AccountCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Context';

const UpdateInfoRequest = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { requestUpdateInfo, getUserInfo } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [initialLoad, setInitialLoad] = useState(true);

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const res = await getUserInfo();
        if (res.success && res.data) {
          setFormData(prev => ({
            ...prev,
            fullName: res.data.fullName || '',
            email: res.data.email || '',
            mobile: res.data.mobile || '',
          }));
        } else {
          setError(res.message || 'Không thể tải thông tin người dùng hiện tại.');
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin người dùng.');
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };
    fetchUserInfo();
  }, [getUserInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setSnackbarOpen(false);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setError('Vui lòng điền đầy đủ Họ và tên, Email và Số điện thoại.');
      return;
    }
    if (formData.password.trim() && formData.password.trim().length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự nếu bạn muốn thay đổi.');
      return;
    }

    setLoading(true);
    try {
      const updateData = {};
      if (formData.fullName.trim()) updateData.FullName = formData.fullName.trim();
      if (formData.email.trim()) updateData.Email = formData.email.trim();
      if (formData.mobile.trim()) updateData.Mobile = formData.mobile.trim();
      if (formData.password.trim()) updateData.Password = formData.password.trim();

      const res = await requestUpdateInfo(
        updateData.FullName,
        updateData.Email,
        updateData.Mobile,
        updateData.Password
      );

      if (res.success) {
        setSnackbarMessage('Yêu cầu cập nhật thông tin đã được gửi thành công!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        setError(res.message || 'Lỗi khi gửi yêu cầu cập nhật thông tin.');
        setSnackbarMessage(res.message || 'Lỗi khi gửi yêu cầu cập nhật thông tin.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError('Lỗi kết nối hoặc không xác định khi gửi yêu cầu.');
      setSnackbarMessage('Lỗi kết nối hoặc không xác định khi gửi yêu cầu.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': { marginLeft: '10px !important', marginTop: '10px !important', borderRadius: '8px !important' },
        'html, body': { 
          overflow: 'hidden', 
        //   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh'
        },
      }} />

      <Box sx={{ 
        minHeight: '100vh',
        width: '1500px',
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        // py: 4
      }}>
        <Container maxWidth="1500px">
          <Fade in={!initialLoad} timeout={800}>
            <Box>
              {/* Header Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  p: 4,
                  mb: 3,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton 
                    onClick={() => navigate(-1)}
                    sx={{ 
                      mr: 2,
                      background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <Avatar 
                    sx={{ 
                      background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                      width: 56,
                      height: 56,
                      mr: 3
                    }}
                  >
                    <AccountCircle sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h4" 
                      fontWeight={700}
                      sx={{
                        background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      Cập nhật thông tin
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Cập nhật họ tên, email, số điện thoại hoặc mật khẩu của bạn
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<Info />} 
                    label="Thông tin cá nhân" 
                    variant="outlined"
                    sx={{ 
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    icon={<Security />} 
                    label="Bảo mật" 
                    variant="outlined"
                    sx={{ 
                      borderColor: '#764ba2',
                      color: '#764ba2',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Paper>

              {/* Loading State */}
              {loading && initialLoad && (
                <Grow in={loading}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      p: 6,
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <CircularProgress 
                      size={60}
                      sx={{ 
                        color: '#667eea',
                        mb: 3
                      }}
                    />
                    <Typography variant="h6" color="text.secondary" fontWeight={500}>
                      Đang tải thông tin của bạn...
                    </Typography>
                  </Paper>
                </Grow>
              )}

              {/* Main Form */}
              {!initialLoad && (
                <Grow in={!initialLoad} timeout={1000}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Box 
                      sx={{ 
                        background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                        p: 3,
                        color: 'white'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Edit />
                        <Typography variant="h6" fontWeight={600}>
                          Thông tin cá nhân
                        </Typography>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 4 }}>
                      <Stack spacing={4}>
                        {/* Personal Info Section */}
                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color="text.primary"
                            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Person sx={{ color: '#667eea' }} />
                            Thông tin cá nhân
                          </Typography>
                          
                          <Stack spacing={3}>
                            <TextField
                              fullWidth
                              label="Họ và tên"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Person sx={{ color: '#667eea' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#667eea'
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                  borderWidth: 2
                                }
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Email sx={{ color: '#667eea' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#667eea'
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                  borderWidth: 2
                                }
                              }}
                            />

                            <TextField
                              fullWidth
                              label="Số điện thoại"
                              name="mobile"
                              type="tel"
                              value={formData.mobile}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Phone sx={{ color: '#667eea' }} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 3,
                                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                  },
                                  '&.Mui-focused': {
                                    backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                  }
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#667eea'
                                },
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#667eea',
                                  borderWidth: 2
                                }
                              }}
                            />
                          </Stack>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(102, 126, 234, 0.2)' }} />

                        {/* Password Section */}
                        <Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            color="text.primary"
                            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Security sx={{ color: '#764ba2' }} />
                            Thay đổi mật khẩu (tùy chọn)
                          </Typography>
                          
                          <TextField
                            fullWidth
                            label="Mật khẩu mới"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Để trống nếu không muốn thay đổi"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Lock sx={{ color: '#764ba2' }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    sx={{ color: '#764ba2' }}
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: 3,
                                backgroundColor: 'rgba(118, 75, 162, 0.04)',
                                '&:hover': {
                                  backgroundColor: 'rgba(118, 75, 162, 0.08)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(118, 75, 162, 0.08)',
                                }
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#764ba2'
                              },
                              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#764ba2',
                                borderWidth: 2
                              }
                            }}
                          />
                        </Box>

                        {error && (
                          <Fade in={!!error}>
                            <Alert 
                              severity="error" 
                              sx={{ 
                                borderRadius: 3,
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                border: '1px solid rgba(244, 67, 54, 0.2)'
                              }}
                            >
                              {error}
                            </Alert>
                          </Fade>
                        )}

                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', pt: 2 }}>
                          <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate(-1)}
                            sx={{ 
                              textTransform: 'none', 
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              fontWeight: 600,
                              borderColor: '#667eea',
                              color: '#667eea',
                              '&:hover': {
                                borderColor: '#5a67d8',
                                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Hủy bỏ
                          </Button>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={loading ? 
                              <CircularProgress size={20} color="inherit" /> : 
                              <CheckCircle />
                            }
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ 
                              textTransform: 'none', 
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              fontWeight: 600,
                              background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                              boxShadow: '0 8px 32px rgba(234, 139, 102, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
                                boxShadow: '0 12px 40px rgba(2, 45, 236, 0.4)',
                                transform: 'translateY(-2px)'
                              },
                              '&:disabled': {
                                background: 'rgba(0,0,0,0.12)',
                                boxShadow: 'none'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Paper>
                </Grow>
              )}
            </Box>
          </Fade>
        </Container>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            borderRadius: 3,
            fontWeight: 500
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UpdateInfoRequest;