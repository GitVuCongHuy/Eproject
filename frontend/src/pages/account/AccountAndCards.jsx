import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, PiggyBank, Facebook, Linkedin, Youtube, Smartphone, TrendingUp, Phone, Mail, MapPin, ExternalLink, } from 'lucide-react';
import AccountBalance from '@mui/icons-material/AccountBalance';
import SecurityIcon from '@mui/icons-material/Security';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Thêm import này

import { Container, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Tabs, Tab, Card, CardContent, Grid, Box, Divider, Stack, IconButton, Tooltip, Paper, GlobalStyles, CircularProgress, Avatar, Chip, Fade, Alert, useTheme } from '@mui/material';
import { useAuth } from '../../context/Context';
import { Info } from 'lucide-react';
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
  // State để quản lý trạng thái hiển thị số dư của từng tài khoản
  const [accountBalanceVisibility, setAccountBalanceVisibility] = useState({});
  // State để quản lý trạng thái hiển thị của tổng tài sản
  const [showTotalBalance, setShowTotalBalance] = useState(false); // Mặc định ẩn tổng tài sản

  const { getCards } = useAuth();

  // Hàm để chuyển đổi trạng thái hiển thị số dư cho một tài khoản cụ thể
  const toggleAccountBalanceVisibility = (accountId) => {
    setAccountBalanceVisibility(prev => ({
      ...prev,
      [accountId]: !prev[accountId] // Đảo ngược trạng thái hiển thị của tài khoản có accountId tương ứng
    }));
  };

  // Hàm để chuyển đổi trạng thái hiển thị tổng tài sản
  const toggleTotalBalanceVisibility = () => {
    setShowTotalBalance(prev => !prev);
  };

  // Hàm để lấy thông tin hiển thị cho cardType
  const getCardTypeInfo = (cardType) => {
    switch (cardType) {
      case 'Credit':
        return {
          label: 'Thẻ tín dụng',
          color: colors.warning,
          bgColor: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'
        };
      case 'Normal':
        return {
          label: 'Thẻ thường',
          color: colors.accent,
          bgColor: 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)'
        };
      default:
        return {
          label: cardType || 'Không xác định',
          color: colors.textSecondary,
          bgColor: 'linear-gradient(135deg, #718096 0%, #4a5568 100%)'
        };
    }
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      setError(null);
      try {
        const cardsResponse = await getCards();

        if (cardsResponse.success) {
          setAccounts(cardsResponse.data);
          // Khởi tạo trạng thái hiển thị số dư cho mỗi tài khoản (mặc định là ẩn)
          const initialVisibility = cardsResponse.data.reduce((acc, account) => {
            acc[account.account_id] = false; // Mặc định ẩn số dư
            return acc;
          }, {});
          setAccountBalanceVisibility(initialVisibility);
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
  // Tổng số dư không cần ẩn, chỉ số dư từng tài khoản mới cần
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
                  <Stack direction="row" alignItems="center" spacing={1}> {/* Thêm Stack cho tổng tài sản */}
                    <Typography variant="h3" fontWeight={700}>
                      {showTotalBalance ? totalBalance.toLocaleString('vi-VN') : '******'}
                    </Typography>
                    {showTotalBalance && (
                      <Typography variant="h3" fontWeight={700}>
                        VND
                      </Typography>
                    )}
                    <Tooltip title={showTotalBalance ? "Ẩn tổng tài sản" : "Hiện tổng tài sản"}>
                      <IconButton
                        onClick={toggleTotalBalanceVisibility}
                        sx={{ color: 'white' }}
                      >
                        {showTotalBalance ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
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
          {accounts.map((account, index) => {
            // Lấy trạng thái hiển thị số dư của tài khoản hiện tại
            const isBalanceVisible = accountBalanceVisibility[account.account_id];
            // Lấy thông tin cardType
            const cardTypeInfo = getCardTypeInfo(account.cardType);

            return (
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
                            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
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
                                label={cardTypeInfo.label}
                                size="small"
                                sx={{
                                  background: cardTypeInfo.bgColor,
                                  color: 'white',
                                  fontWeight: 500,
                                  '& .MuiChip-label': {
                                    fontSize: '0.75rem'
                                  }
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
                        {/* Stack để chứa số dư và nút mắt */}
                        <Stack direction="row" alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                          <Typography variant="h4" fontWeight={700} color={colors.textPrimary}>
                            {isBalanceVisible ? account.balance.toLocaleString('vi-VN') : '******'}
                          </Typography>
                          {isBalanceVisible && ( // Chỉ hiển thị "VND" nếu số dư đang hiển thị
                            <Typography variant="h4" fontWeight={700} color={colors.textPrimary}>
                              VND
                            </Typography>
                          )}
                          <Tooltip title={isBalanceVisible ? "Ẩn số dư" : "Hiện số dư"}>
                            <IconButton
                              onClick={() => toggleAccountBalanceVisibility(account.account_id)} // Truyền account_id vào hàm
                              sx={{ color: colors.textPrimary }} // Điều chỉnh màu sắc icon cho phù hợp với theme
                            >
                              {isBalanceVisible ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Paper>
              </Fade>
            );
          })}
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
                  onClick={() => setOpenDialog(true)}
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
                  onClick={() => setOpenDialog(true)}
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
                  onClick={() => setOpenDialog(true)}
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
            marginLeft: '10px !important',
            marginTop: '10px!important',
          },
          'html, body': {
            overflowY: 'scroll', 
            backgroundColor: colors.background,
          },
        }} />
      <Container maxWidth="100vw" sx={{ py: 4 }}>
        <Fade in={true} timeout={400}>
          <Box>
            <Typography
              variant="h3"
              fontWeight={700}
              color={colors.textPrimary}
              sx={{ mb: 1 }}
            >
              Tài khoản của tôi
            </Typography>
            <Typography
              variant="h6"
              color={colors.textSecondary}
              sx={{ mb: 4 }}
            >
              Quản lý tài khoản và theo dõi số dư một cách dễ dàng
            </Typography>
          </Box>
        </Fade>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: `1px solid ${colors.border}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: colors.textSecondary,
                '&.Mui-selected': {
                  color: colors.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary,
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab} />
            ))}
          </Tabs>

          <Box sx={{ p: 4 }}>
            {renderContent()}
          </Box>
        </Paper>

        {/* Footer thông tin liên hệ */}
        <Fade in={true} timeout={1400}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              p: 4,
              mt: 4
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Hỗ trợ khách hàng
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Phone size={20} color={colors.primary} />
                    <Typography>1900 545 413</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Mail size={20} color={colors.primary} />
                    <Typography>support@techcombank.com.vn</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <MapPin size={20} color={colors.primary} />
                    <Typography>191 Bà Triệu, Hai Bà Trưng, Hà Nội</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Kết nối với chúng tôi
                </Typography>
                <Stack direction="row" spacing={2}>
                  <IconButton
                    sx={{
                      background: colors.gradientPrimary,
                      color: 'white',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <Facebook size={20} />
                  </IconButton>
                  <IconButton
                    sx={{
                      background: colors.gradientSecondary,
                      color: 'white',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <Linkedin size={20} />
                  </IconButton>
                  <IconButton
                    sx={{
                      background: colors.gradientSuccess,
                      color: 'white',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  >
                    <Youtube size={20} />
                  </IconButton>
                </Stack>
                <Typography variant="body2" color={colors.textSecondary} sx={{ mt: 2 }}>
                  Tải ứng dụng Techcombank Mobile để trải nghiệm dịch vụ tốt nhất
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Smartphone />}
                  endIcon={<ExternalLink size={16} />}
                  sx={{
                    mt: 2,
                    borderRadius: 3,
                    textTransform: 'none',
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      background: colors.primary,
                      color: 'white'
                    }
                  }}
                >
                  Tải ứng dụng
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Dialog mở tài khoản mới */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: colors.surface
            }
          }}
        >
<DialogTitle
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    py: 4,
    textAlign: 'center',
    borderRadius: 2,
    bgcolor: '#f9fafb',
  }}
>
  <Box
    sx={{
      bgcolor: '#e0f2fe',
      borderRadius: '50%',
      p: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Info size={32} color="#0288d1" />
  </Box>

  <Typography variant="h6" fontWeight={600} mt={1}>
    Chúng tôi đang cập nhật chức năng này
  </Typography>

  <Typography variant="body2" color="text.secondary" maxWidth={300}>
    Vui lòng quay lại sau khi hệ thống hoàn tất nâng cấp. Cảm ơn bạn đã quan tâm!
  </Typography>
</DialogTitle>
        
        </Dialog>
      </Container>
    </>
  );
}

