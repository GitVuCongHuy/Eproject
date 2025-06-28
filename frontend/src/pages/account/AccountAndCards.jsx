import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  CreditCard, 
  PiggyBank, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Smartphone,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import AccountBalance from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';

import { 
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Grid, 
  Box, 
  Divider, 
  Stack, 
  IconButton, 
  Paper, 
  GlobalStyles, 
  CircularProgress,
  Avatar,
  Chip,
  Fade,
  Alert,
  useTheme
} from '@mui/material';
import { useAuth } from '../../context/context';

// Bảng màu hiện đại
const colors = {
  primary: '#e53e3e',
  primaryLight: '#feb2b2',
  primaryDark: '#c53030',
  secondary: '#1a202c',
  accent: '#3182ce',
  success: '#38a169',
  warning: '#ed8936',
  background: '#f7fafc',
  surface: '#ffffff',
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  border: '#e2e8f0',
  gradientPrimary: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
  gradientSecondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientSuccess: 'linear-gradient(135deg, #38a169 0%, #25855a 100%)',
  glassEffect: 'rgba(255, 255, 255, 0.25)',
};

export default function TechcombankAccountsPage() {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getCards } = useAuth();

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cardsResponse = await getCards();

        if (cardsResponse.success) {
          setAccounts(cardsResponse.data);
        } else {
          throw new Error(cardsResponse.message || 'Không thể lấy danh sách tài khoản.');
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tài khoản:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [getCards]);

  const tabs = ['Tài khoản'];
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const renderContent = () => {
    if (loading) {
      return (
        <Fade in={loading}>
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={10}>
            <CircularProgress size={60} sx={{ color: colors.primary, mb: 3 }} />
            <Typography variant="h6" color={colors.textSecondary}>
              Đang tải dữ liệu tài khoản...
            </Typography>
          </Box>
        </Fade>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3,
            my: 4,
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          <div>
            <Typography variant="h6" sx={{ mb: 1 }}>Có lỗi xảy ra</Typography>
            <Typography>{error}</Typography>
          </div>
        </Alert>
      );
    }

    if (accounts.length === 0) {
      return (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 4,
            background: colors.surface,
            border: `1px dashed ${colors.border}`
          }}
        >
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 3,
              background: colors.gradientPrimary
            }}
          >
            <CreditCard size={40} />
          </Avatar>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Bạn chưa có tài khoản nào
          </Typography>
          <Typography color={colors.textSecondary} sx={{ mb: 4 }}>
            Hãy mở tài khoản đầu tiên để bắt đầu sử dụng dịch vụ
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Plus />}
            onClick={() => setOpenDialog(true)}
            sx={{
              background: colors.gradientPrimary,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1.5
            }}
          >
            Mở tài khoản mới
          </Button>
        </Paper>
      );
    }

    return (
      <>
        {/* Tổng số dư */}
        <Fade in={true} timeout={600}>
          <Paper
            elevation={0}
            sx={{
              background: colors.gradientPrimary,
              borderRadius: 4,
              p: 4,
              mb: 4,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng tài sản
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {totalBalance.toLocaleString('vi-VN')} VND
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {accounts.length} tài khoản
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80,
                    background: colors.glassEffect,
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <AccountBalance sx={{ fontSize: 40 }} />
                </Avatar>
              </Stack>
            </Box>
          </Paper>
        </Fade>

        {/* Danh sách tài khoản */}
        <Stack spacing={3} mb={4}>
          {accounts.map((account, index) => (
            <Fade key={account.account_id} in={true} timeout={800 + index * 100}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                    borderColor: colors.primary
                  }
                }}
              >
                <CardContent sx={{ p: '24px !important' }}>
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} md={8}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: colors.gradientSecondary,
                            color: 'white'
                          }}
                        >
                          <CreditCard size={28} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={600} color={colors.textPrimary}>
                            Tài khoản thanh toán
                          </Typography>
                          {account.cardNumber && (
                            <Typography 
                              variant="body1" 
                              sx={{
                                fontFamily: 'monospace',
                                letterSpacing: '2px',
                                color: colors.textSecondary,
                                mt: 0.5,
                                fontSize: '1.1rem'
                              }}
                            >
                              {account.cardNumber}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} mt={1}>
                            <Chip 
                              label="Hoạt động" 
                              size="small"
                              sx={{
                                background: colors.gradientSuccess,
                                color: 'white',
                                fontWeight: 500
                              }}
                            />
                            <Chip 
                              label="Chính" 
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: colors.primary,
                                color: colors.primary,
                                fontWeight: 500
                              }}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 2, md: 0 } }}>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ mb: 0.5 }}>
                        Số dư khả dụng
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color={colors.textPrimary}>
                        {account.balance.toLocaleString('vi-VN')}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary}>
                        VND
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Paper>
            </Fade>
          ))}
        </Stack>

        {/* Các tính năng nhanh */}
        <Fade in={true} timeout={1200}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              p: 3,
              mb: 4
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Tính năng nhanh
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={() => setOpenDialog(true)}
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    textTransform: 'none',
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      background: colors.primary,
                      color: 'white'
                    }
                  }}
                >
                  Mở tài khoản
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    textTransform: 'none',
                    borderColor: colors.success,
                    color: colors.success,
                    '&:hover': {
                      background: colors.success,
                      color: 'white'
                    }
                  }}
                >
                  Đầu tư
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PiggyBank />}
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    textTransform: 'none',
                    borderColor: colors.warning,
                    color: colors.warning,
                    '&:hover': {
                      background: colors.warning,
                      color: 'white'
                    }
                  }}
                >
                  Tiết kiệm
                </Button>
              </Grid>
              <Grid item xs={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 2,
                    textTransform: 'none',
                    borderColor: colors.accent,
                    color: colors.accent,
                    '&:hover': {
                      background: colors.accent,
                      color: 'white'
                    }
                  }}
                >
                  Bảo hiểm
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      </>
    );
  };

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px!important',
        },
        'html, body': {
          overflow: 'auto',
          backgroundColor: colors.background,
        },
      }} />

      <Box sx={{ background: `linear-gradient(135deg, ${colors.background} 0%, #edf2f7 100%)`, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="100vw">
          {/* Header hiện đại */}
          <Fade in={true} timeout={400}>
            <Box sx={{ mb: 6 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color={colors.textPrimary}>
                    Tài khoản & Thẻ
                  </Typography>
                  <Typography variant="body1" color={colors.textSecondary} sx={{ mt: 1 }}>
                    Quản lý và theo dõi tất cả tài khoản của bạn
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  startIcon={<Plus size={18} />}
                  onClick={() => setOpenDialog(true)}
                  sx={{
                    background: colors.gradientPrimary,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  Mở tài khoản
                </Button>
              </Stack>
            </Box>
          </Fade>

          {/* Tabs hiện đại */}
          <Fade in={true} timeout={600}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                mb: 4,
                background: colors.surface,
                border: `1px solid ${colors.border}`
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newVal) => setActiveTab(newVal)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2
                  },
                  '& .Mui-selected': {
                    color: colors.primary
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.primary,
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                {tabs.map((label) => (
                  <Tab key={label} label={label} />
                ))}
              </Tabs>
            </Paper>
          </Fade>

          {/* Nội dung chính */}
          {renderContent()}

          {/* Footer hiện đại */}
          <Fade in={true} timeout={1400}>
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 8, 
                borderRadius: 4,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                overflow: 'hidden'
              }}
            >
              {/* Header của footer */}
              <Box 
                sx={{ 
                  background: colors.gradientPrimary,
                  color: 'white',
                  p: 4,
                  textAlign: 'center'
                }}
              >
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'white',
                      color: colors.primary,
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}
                  >
                    TCB
                  </Avatar>
                  <Typography variant="h5" fontWeight={700}>
                    Techcombank
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Ngân hàng số hàng đầu Việt Nam
                </Typography>
              </Box>

              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: colors.textPrimary }}>
                      Thông tin liên hệ
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, background: colors.gradientSuccess }}>
                          <Phone size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>Hotline 24/7</Typography>
                          <Typography variant="body2" color={colors.textSecondary}>
                            1800 588 822 / +84 243 944 6699
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, background: colors.gradientSecondary }}>
                          <Mail size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>Email hỗ trợ</Typography>
                          <Typography variant="body2" color={colors.textSecondary}>
                            call_center@techcombank.com.vn
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' }}>
                          <MapPin size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>Trụ sở chính</Typography>
                          <Typography variant="body2" color={colors.textSecondary}>
                            Số 6 Phố Quang Trung, P. Trần Hưng Đạo,<br />
                            Q. Hoàn Kiếm, Hà Nội
                          </Typography>
                          <Typography variant="body2" color={colors.textSecondary} sx={{ mt: 1 }}>
                            <strong>Mã SWIFT:</strong> VTCBVNVX
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} mt={3}>
                      <IconButton 
                        sx={{ 
                          bgcolor: '#1877f2', 
                          color: 'white',
                          '&:hover': { bgcolor: '#166fe5' }
                        }}
                      >
                        <Facebook size={18} />
                      </IconButton>
                      <IconButton 
                        sx={{ 
                          bgcolor: '#0077b5', 
                          color: 'white',
                          '&:hover': { bgcolor: '#006399' }
                        }}
                      >
                        <Linkedin size={18} />
                      </IconButton>
                      <IconButton 
                        sx={{ 
                          bgcolor: '#ff0000', 
                          color: 'white',
                          '&:hover': { bgcolor: '#cc0000' }
                        }}
                      >
                        <Youtube size={18} />
                      </IconButton>
                      <IconButton 
                        sx={{ 
                          bgcolor: '#0068ff', 
                          color: 'white',
                          '&:hover': { bgcolor: '#0052cc' }
                        }}
                      >
                        <Typography fontSize={12} fontWeight="bold">Z</Typography>
                      </IconButton>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: colors.textPrimary }}>
                      Tải app ngay
                    </Typography>
                    <Stack spacing={3}>
                      <Button 
                        fullWidth
                        variant="contained" 
                        startIcon={<Smartphone size={20} />}
                        endIcon={<ExternalLink size={16} />}
                        sx={{ 
                          bgcolor: '#000', 
                          color: 'white',
                          borderRadius: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#333' }
                        }}
                      >
                        Tải trên Google Play
                      </Button>
                      <Button 
                        fullWidth
                        variant="contained" 
                        startIcon={<Typography fontSize={20}>🍎</Typography>}
                        endIcon={<ExternalLink size={16} />}
                        sx={{ 
                          bgcolor: '#000', 
                          color: 'white',
                          borderRadius: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': { bgcolor: '#333' }
                        }}
                      >
                        Tải trên App Store
                      </Button>
                    </Stack>
                    
                    <Typography variant="body2" color={colors.textSecondary} sx={{ mt: 3, lineHeight: 1.6 }}>
                      Tải ứng dụng Techcombank Mobile để trải nghiệm dịch vụ ngân hàng điện tử 
                      hiện đại, tiện lợi mọi nơi, mọi lúc.
                    </Typography>

                    <Box sx={{ mt: 3, p: 3, bgcolor: colors.background, borderRadius: 3 }}>
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                        Tính năng nổi bật:
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary}>
                        • Chuyển tiền 24/7<br />
                        • Thanh toán hóa đơn<br />
                        • Quản lý tài chính thông minh<br />
                        • Bảo mật sinh trắc học
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography 
                  variant="body2" 
                  color={colors.textSecondary} 
                  align="center"
                  sx={{ fontWeight: 500 }}
                >
                  © 2024 Ngân Hàng TMCP Kỹ Thương Việt Nam - Techcombank. Bảo lưu mọi quyền.
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>
     <Dialog 
  open={openDialog} 
  onClose={() => setOpenDialog(false)} 
  maxWidth="xs" 
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 5,
      p: 4,
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }
  }}
>
  {/* Vòng tròn nền phía sau */}
  <Box
    sx={{
      position: 'absolute',
      width: 160,
      height: 160,
      background: colors.primaryLight,
      borderRadius: '50%',
      top: -40,
      right: -40,
      opacity: 0.3,
      zIndex: 0
    }}
  />
  
  <Avatar
    sx={{
      width: 72,
      height: 72,
      bgcolor: colors.primary,
      color: 'white',
      mx: 'auto',
      mb: 2,
      zIndex: 1,
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
    }}
  >
    <Plus />
  </Avatar>

  <DialogTitle sx={{ 
    fontWeight: 700, 
    fontSize: '1.6rem', 
    color: colors.primaryDark,
    zIndex: 1
  }}>
    Mở tài khoản
  </DialogTitle>

  <DialogContent sx={{ zIndex: 1 }}>
    <Typography 
      variant="body1" 
      sx={{ mt: 1.5, mb: 2, color: colors.textPrimary }}
    >
      Vui lòng đến <strong>chi nhánh gần nhất</strong> để mở tài khoản.
    </Typography>
  </DialogContent>

  <DialogActions sx={{ justifyContent: 'center', zIndex: 1 }}>
    <Button 
      variant="contained" 
      onClick={() => setOpenDialog(false)} 
      sx={{ 
        borderRadius: 4, 
        background: colors.gradientPrimary,
        textTransform: 'none',
        fontWeight: 600,
        px: 5,
        py: 1.25,
        boxShadow: '0 4px 12px rgba(229,62,62,0.4)',
        '&:hover': {
          background: colors.primaryDark
        }
      }}
    >
      Đã hiểu
    </Button>
  </DialogActions>
</Dialog>
 
    </>
    
  );
}