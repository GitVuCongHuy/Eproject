// src/pages/Home/Home.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/context';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Avatar, 
  useTheme, 
  CircularProgress, 
  Alert, 
  GlobalStyles, 
  IconButton, 
  Tooltip, 
  Chip,
  Fade,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import { 
  CreditCard, 
  ArrowUpward, 
  ArrowDownward, 
  ChevronRight, 
  Clear, 
  PictureAsPdf,
  TrendingUpRounded,
  AccountBalanceWallet,
  AttachMoney,
  FilterList
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import vi from 'date-fns/locale/vi';

// Import thư viện PDF và font chữ
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { callAddFont } from '../../Roboto-Regular-normal.js'; 

// Bảng màu hiện đại với gradient
const colors = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  success: '#00d4aa',
  warning: '#ff6b35',
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientSuccess: 'linear-gradient(135deg, #00d4aa 0%, #01a085 100%)',
  gradientWarning: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
  cardGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  glassEffect: 'rgba(255, 255, 255, 0.25)',
};

// Hàm helper để định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return amount;
  return amount.toLocaleString('vi-VN');
};

const Home = () => {
  const theme = useTheme();
  const { getUserInfo, getCards, getTransactions } = useAuth();

  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userResult = await getUserInfo();
        if (userResult.success) setUser(userResult.data);
        else throw new Error(userResult.message || 'Không thể lấy thông tin người dùng.');

        const cardsResult = await getCards();
        if (cardsResult.success) {
          setCards(cardsResult.data);
          
          if (cardsResult.data && cardsResult.data.length > 0) {
            const firstCardId = cardsResult.data[0].account_id;
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            const transactionsResult = await getTransactions(firstCardId, month, year);
            if (transactionsResult.success) {
              const sortedTransactions = transactionsResult.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
              setTransactions(sortedTransactions);
            }
          }
        } else {
          throw new Error(cardsResult.message || 'Không thể lấy danh sách thẻ.');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getUserInfo, getCards, getTransactions]);
  
  const filteredTransactions = transactions.filter(transaction => {
    if (!selectedDate) return true;
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate.toDateString() === selectedDate.toDateString();
  });

  // Hàm xử lý xuất PDF
  const handleExportPDF = () => {
    const transactionsToExport = filteredTransactions;
    if (transactionsToExport.length === 0) {
      alert("Không có dữ liệu giao dịch để xuất.");
      return;
    }

    const doc = new jsPDF();
    
    callAddFont.call(doc); 
    doc.setFont('Roboto-Regular', 'normal');

    doc.setFontSize(18);
    doc.text("LỊCH SỬ GIAO DỊCH", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Chủ tài khoản: ${user?.full_name || 'N/A'}`, 14, 29);
    doc.text(`Số thẻ: ${cards.length > 0 ? cards[0].cardNumber : 'N/A'}`, 14, 36);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 43);

    const tableColumn = ["Ngày", "Mô tả", "Số tiền (VND)", "Loại", "Trạng thái"];
    const tableRows = [];

    transactionsToExport.forEach(item => {
      const transactionData = [
        new Date(item.transactionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        item.description,
        `${item.transactionType === 'Deposit' ? '+' : '-'}${formatCurrency(item.amount)}`,
        item.transactionType === 'Deposit' ? 'Nhận tiền' : 'Chuyển/Rút tiền',
        item.status
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      headStyles: { fillColor: [41, 128, 185], textColor: 255, font: 'Roboto-Regular', fontStyle: 'bold' },
      styles: { font: 'Roboto-Regular', fontStyle: 'normal' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const safeUserName = user?.full_name?.replace(/[^a-zA-Z0-9]/g, '') || 'User';
    doc.save(`LichSuGiaoDich_${safeUserName}_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        sx={{ background: colors.background }}
      >
        <Fade in={loading}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: colors.accent, mb: 2 }} />
            <Typography variant="h6" color={colors.textSecondary}>
              Đang tải dữ liệu...
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, background: colors.background, minHeight: '100vh' }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      </Box>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <GlobalStyles 
        styles={{ 
          '._mainContent_b1piq_13': { 
            marginLeft: '30px !important', 
            marginTop: '30px!important' 
          }, 
          'html, body': { 
            overflow: 'hidden', 
            backgroundColor: colors.background 
          } 
        }} 
      />
      
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.background} 0%, #e2e8f0 100%)`,
          p: 3
        }}
      >
        {/* Header với hiệu ứng gradient */}
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
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.05"%3E%3Cpath d="m0 40l40-40h-40v40zm40 0v40h-40l40-40z"/%3E%3C/g%3E%3C/svg%3E")',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    background: colors.glassEffect,
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <AccountBalanceWallet sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    Xin chào, {user?.full_name?.toUpperCase()}!
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Chào mừng bạn quay trở lại. Hãy cùng xem tình hình tài chính của bạn hôm nay.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Fade>

        {/* Thẻ tài khoản với hiệu ứng glass morphism */}
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4 }}>
            {cards.length > 0 ? cards.map((card, index) => (
              <Paper
                key={card.account_id}
                elevation={0}
                sx={{
                  background: colors.cardGradient,
                  borderRadius: 4,
                  p: 4,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 2,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  },
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
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          background: colors.glassEffect,
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <CreditCard sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                          Tài khoản thanh toán
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            letterSpacing: '2px',
                            opacity: 0.9,
                            fontSize: '1.1rem'
                          }}
                        >
                          {card.cardNumber}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box textAlign="right">
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                        Số dư khả dụng
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {formatCurrency(card.balance)} VND
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            )) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Không tìm thấy tài khoản nào.
              </Alert>
            )}
          </Box>
        </Fade>

        {/* Hoạt động gần đây với thiết kế hiện đại */}
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              minHeight: '500px'
            }}
          >
            {/* Header của phần giao dịch */}
            <Box 
              sx={{ 
                p: 3, 
                background: `linear-gradient(90deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                borderBottom: `1px solid ${colors.border}`
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ background: colors.gradientSuccess }}>
                    <TrendingUpRounded />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} color={colors.textPrimary}>
                      Hoạt động gần đây
                    </Typography>
                    <Typography variant="body2" color={colors.textSecondary}>
                      {filteredTransactions.length} giao dịch
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Tooltip title="Xuất danh sách giao dịch ra PDF">
                    <IconButton 
                      onClick={handleExportPDF}
                      sx={{ 
                        background: colors.gradientWarning,
                        color: 'white',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          background: colors.gradientWarning,
                        }
                      }}
                    >
                      <PictureAsPdf />
                    </IconButton>
                  </Tooltip>
                  
                  <DatePicker
                    label="Lọc theo ngày"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            background: colors.background
                          }
                        }
                      }, 
                      inputAdornment: { 
                        position: 'end', 
                        children: selectedDate && (
                          <IconButton 
                            size="small" 
                            onClick={() => setSelectedDate(null)} 
                            sx={{ marginRight: '-8px' }}
                          >
                            <Clear />
                          </IconButton>
                        ) 
                      }
                    }}
                    sx={{ width: '200px' }}
                  />
                  
                  <Button 
                    variant="outlined" 
                    endIcon={<ChevronRight />} 
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: colors.accent,
                      color: colors.accent,
                      '&:hover': {
                        background: colors.accent,
                        color: 'white'
                      }
                    }}
                  >
                    Xem tất cả
                  </Button>
                </Stack>
              </Stack>
            </Box>
            
            {/* Danh sách giao dịch */}
            <Box 
              sx={{ 
                p: 3,
                maxHeight: '600px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { 
                  width: '8px' 
                }, 
                '&::-webkit-scrollbar-track': { 
                  backgroundColor: colors.background,
                  borderRadius: '4px'
                }, 
                '&::-webkit-scrollbar-thumb': { 
                  backgroundColor: colors.textSecondary,
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: colors.textPrimary
                  }
                }
              }}
            >
              {filteredTransactions.length > 0 ? (
                <Stack spacing={3}>
                  {filteredTransactions.map((item, index) => (
                    <Fade key={item.transactionId} in={true} timeout={600 + index * 100}>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            textTransform: 'uppercase', 
                            fontWeight: 600, 
                            color: colors.textSecondary,
                            mb: 1, 
                            display: 'block',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {new Date(item.transactionDate).toLocaleDateString('vi-VN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                        
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: `1px solid ${colors.border}`,
                            background: colors.surface,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                              borderColor: colors.accent
                            }
                          }}
                        >
                          <CardContent sx={{ p: '20px !important' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={3} alignItems="center">
                                <Avatar 
                                  sx={{ 
                                    width: 48,
                                    height: 48,
                                    background: item.transactionType === 'Deposit' 
                                      ? colors.gradientSuccess 
                                      : colors.gradientWarning,
                                    color: 'white'
                                  }}
                                >
                                  {item.transactionType === 'Deposit' ? 
                                    <ArrowUpward /> : 
                                    <ArrowDownward />
                                  }
                                </Avatar>
                                <Box>
                                  <Typography 
                                    variant="body1" 
                                    fontWeight={600}
                                    color={colors.textPrimary}
                                    sx={{ mb: 0.5 }}
                                  >
                                    {item.description}
                                  </Typography>
                                  <Chip
                                    label={item.status}
                                    size="small"
                                    sx={{
                                      background: colors.background,
                                      color: colors.textSecondary,
                                      fontWeight: 500
                                    }}
                                  />
                                </Box>
                              </Stack>
                              
                              <Chip
                                label={`${item.transactionType === 'Deposit' ? '+' : '-'}${formatCurrency(item.amount)}`}
                                sx={{
                                  background: item.transactionType === 'Deposit' 
                                    ? colors.gradientSuccess 
                                    : colors.gradientWarning,
                                  color: 'white',
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  height: '36px',
                                  borderRadius: 2
                                }}
                              />
                            </Stack>
                          </CardContent>
                        </Paper>
                      </Box>
                    </Fade>
                  ))}
                </Stack>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    color: colors.textSecondary 
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 3,
                      background: colors.background,
                      color: colors.textSecondary
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    Không có giao dịch nào
                  </Typography>
                  <Typography variant="body2">
                    {selectedDate 
                      ? `trong ngày ${selectedDate.toLocaleDateString('vi-VN')}` 
                      : 'gần đây'
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Fade>
      </Box>
    </LocalizationProvider>
  );
};

export default Home;