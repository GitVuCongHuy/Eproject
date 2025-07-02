import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField,
  CircularProgress, Alert, Stack, Snackbar, Container, Fade,
  IconButton, InputAdornment, Paper, Avatar, Card,
  LinearProgress, Chip, GlobalStyles
} from '@mui/material';
import {
  Lock, ArrowBack, Visibility, VisibilityOff,
  Security, CheckCircle, LockOutlined, Key,
  Shield, VpnKey
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Context'; 

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { changePassword, logout } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[@$!%*?&]/.test(password)
    };
    
    Object.values(checks).forEach(check => check && score++);
    
    if (score < 3) return { score: score * 20, label: 'Yếu', color: 'error' };
    if (score < 4) return { score: score * 20, label: 'Trung bình', color: 'warning' };
    if (score < 5) return { score: score * 20, label: 'Mạnh', color: 'info' };
    return { score: 100, label: 'Rất mạnh', color: 'success' };
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSnackbarOpen(false);

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Mật khẩu mới và mật khẩu xác nhận không khớp.');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setError('Mật khẩu mới không đủ mạnh. Vui lòng tuân thủ yêu cầu.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(formData.currentPassword, formData.newPassword);

      if (res.success) {
        setSnackbarMessage(res.message || 'Đổi mật khẩu thành công! Bạn sẽ được đăng xuất.');
        setSnackbarOpen(true);

        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 2000); 

      } else {
        setError(res.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
      }
    } catch (err) {
      console.error("Change Password Error:", err);
      setError('Lỗi kết nối hoặc không xác định. Vui lòng thử lại.');
    } finally {
      if (!e.defaultPrevented) {
        setLoading(false);
      }
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <>
          <GlobalStyles 
            styles={{
              '._mainContent_b1piq_13': 
                {marginLeft: '0px !important', 
                marginTop: '0px !important',
                padding: '0px !important'},
              'html, body': {
                overflowY: 'hidden', 
                }, 
              }} />
    
      {/* Background với gradient đỏ */}
      <Box 
        sx={{ 
          minHeight: '100vh', 
          width: '100%',
              background: 'url("https://i.pinimg.com/originals/08/6c/9a/086c9a9c9e90cb1cbdc51e8a394a304f.gif")',

          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.03"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Card 
              elevation={0}
              sx={{ 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
              }}
            >
              {/* Header */}
              <Box 
                sx={{ 
                  background: 'linear-gradient(135deg,rgb(159, 144, 199) 0%, #c53030 100%)',
                  p: 3,
                  textAlign: 'center',
                  color: 'white',
                  position: 'relative'
                }}
              >
                <IconButton 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  sx={{ 
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>

                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    width: 60, 
                    height: 60, 
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <Shield sx={{ fontSize: 32, color: 'white' }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  Đổi Mật Khẩu
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Bảo vệ tài khoản với mật khẩu mạnh
                </Typography>
              </Box>

              {/* Form Content */}
              <Box sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    {/* Current Password */}
                    <TextField
                      fullWidth
                      required
                      name="currentPassword"
                      label="Mật khẩu hiện tại"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(229, 62, 62, 0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(229, 62, 62, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(229, 62, 62, 0.08)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: '#e53e3e' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
                              edge="end"
                              sx={{ color: '#e53e3e' }}
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* New Password */}
                    <Box>
                      <TextField
                        fullWidth
                        required
                        name="newPassword"
                        label="Mật khẩu mới"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        size="medium"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'rgba(229, 62, 62, 0.05)',
                            '&:hover': {
                              backgroundColor: 'rgba(229, 62, 62, 0.08)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'rgba(229, 62, 62, 0.08)',
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Key sx={{ color: '#e53e3e' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                onClick={() => setShowNewPassword(!showNewPassword)} 
                                edge="end"
                                sx={{ color: '#e53e3e' }}
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Password Strength - Compact */}
                      {formData.newPassword && (
                        <Box sx={{ mt: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Độ mạnh
                            </Typography>
                            <Chip 
                              label={passwordStrength.label} 
                              size="small"
                              color={passwordStrength.color}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={passwordStrength.score} 
                            color={passwordStrength.color}
                            sx={{ 
                              height: 4, 
                              borderRadius: 2,
                              backgroundColor: 'rgba(0,0,0,0.1)'
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Confirm Password */}
                    <TextField
                      fullWidth
                      required
                      name="confirmNewPassword"
                      label="Xác nhận mật khẩu"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      size="medium"
                      error={formData.newPassword !== formData.confirmNewPassword && formData.confirmNewPassword !== ''}
                      helperText={
                        formData.newPassword !== formData.confirmNewPassword && formData.confirmNewPassword !== ''
                        ? 'Mật khẩu không khớp'
                        : '8-16 ký tự, gồm hoa, thường, số, ký tự đặc biệt'
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(229, 62, 62, 0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(229, 62, 62, 0.08)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(229, 62, 62, 0.08)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <VpnKey sx={{ color: '#e53e3e' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                              edge="end"
                              sx={{ color: '#e53e3e' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Error Alert - Compact */}
                    {error && (
                      <Fade in={!!error}>
                        <Alert 
                          severity="error" 
                          sx={{ 
                            borderRadius: 2,
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                            py: 1
                          }}
                        >
                          {error}
                        </Alert>
                      </Fade>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                      disabled={loading}
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: 'linear-gradient(135deg,rgb(63, 68, 134) 0%, #c53030 100%)',
                        boxShadow: '0 6px 20px rgba(229, 62, 62, 0.3)',
                        '&:hover': { 
                          boxShadow: '0 8px 25px rgba(229, 62, 62, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                        '&:disabled': {
                          opacity: 0.7
                        },
                        transition: 'all 0.3s ease',
                        mt: 1
                      }}
                    >
                      {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                    </Button>
                  </Stack>
                </form>
              </Box>
            </Card>
          </Fade>
        </Container>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChangePasswordPage;