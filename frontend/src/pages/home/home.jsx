// src/pages/Home/Home.jsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context.jsx';
import { 
    Box, Typography, Card, CardContent, Button, Avatar, useTheme, CircularProgress, Alert, 
    GlobalStyles, IconButton, Tooltip, Chip, Fade, Paper, Divider, Stack, Dialog, 
    DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
// Thêm icon ReplayCircleFilled cho hoàn tiền
import { 
    CreditCard, ArrowUpward, ArrowDownward, ChevronRight, Clear, PictureAsPdf, 
    TrendingUpRounded, AccountBalanceWallet, AttachMoney, FilterList, Visibility, 
    VisibilityOff, ReceiptLong, CalendarToday, Notes, AccountCircle, Send, 
    CallReceived, ReplayCircleFilled 
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import vi from 'date-fns/locale/vi';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { callAddFont } from '../../Roboto-Regular-normal.js';

const colors = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  success: '#00d4aa',
  warning: '#ff6b35',
  info: '#42a5f5', // Màu cho hoàn tiền
  background: '#f8fafc',
  surface: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  gradientPrimary: 'linear-gradient(135deg,rgb(234, 155, 102) 0%, #764ba2 100%)',
  gradientSuccess: 'linear-gradient(135deg, #00d4aa 0%, #01a085 100%)',
  gradientWarning: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
  gradientInfo: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)', // Gradient cho hoàn tiền
  cardGradient: 'linear-gradient(135deg,rgb(234, 150, 102) 0%, #764ba2 100%)',
  glassEffect: 'rgba(255, 255, 255, 0.25)',
};

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
  const [cardBalanceVisibility, setCardBalanceVisibility] = useState({});
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleOpenDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedTransaction(null), 300);
  };

  const toggleCardBalanceVisibility = (accountId) => {
    setCardBalanceVisibility(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  // <<< SỬA LẠI PHẦN NÀY: Trả về cấu trúc useEffect gốc của bạn >>>
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true); setError(null);
        const userResult = await getUserInfo();
        if (userResult.success) setUser(userResult.data);
        else throw new Error(userResult.message || 'Không thể lấy thông tin người dùng.');
        
        const cardsResult = await getCards();
        if (cardsResult.success) {
          setCards(cardsResult.data);
          const initialVisibility = cardsResult.data.reduce((acc, card) => {
            acc[card.account_id] = false;
            return acc;
          }, {});
          setCardBalanceVisibility(initialVisibility);
          if (cardsResult.data && cardsResult.data.length > 0) {
            setSelectedCardId(cardsResult.data[0].account_id);
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
    fetchInitialData();
  }, [getUserInfo, getCards]);


  // <<< SỬA LẠI PHẦN NÀY: Trả về cấu trúc useEffect gốc và sửa logic xử lý data >>>
  useEffect(() => {
    if (!selectedCardId || cards.length === 0) return;

    const fetchTransactionsForCard = async () => {
      setIsFetchingTransactions(true);
      setTransactions([]);
      setError(null);
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const transactionsResult = await getTransactions(selectedCardId, month, year);

        if (transactionsResult.success) {
          const selectedCard = cards.find(card => card.account_id === selectedCardId);
          if (!selectedCard) throw new Error("Không tìm thấy thông tin thẻ đã chọn.");
          
          const currentCardNumber = (selectedCard.CardNumber || selectedCard.cardNumber)?.replace(/\s/g, '');

          // <<< CHỈ SỬA LOGIC DUY NHẤT Ở ĐÂY >>>
          const processedTransactions = transactionsResult.data.map(t => {
            let transactionType;
            const descriptionLower = (t.description || '').toLowerCase();

            if (descriptionLower.includes('hoàn phí')) {
              transactionType = 'Refund';
            } else if (t.senderAccount === currentCardNumber) {
              transactionType = 'Withdrawal';
            } else {
              transactionType = 'Deposit';
            }
            
            return { ...t, transaction_type: transactionType };
          });

          const sortedTransactions = processedTransactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
          setTransactions(sortedTransactions);
        } else {
          setError(`Không thể lấy lịch sử giao dịch. ${transactionsResult.message || ''}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetchingTransactions(false);
      }
    };

    fetchTransactionsForCard();
  }, [selectedCardId, cards, getTransactions]); // Giữ nguyên dependency array gốc của bạn

  const filteredTransactions = transactions.filter(transaction => {
    if (!selectedDate) return true;
    const transactionDate = new Date(transaction.transactionDate);
    return transactionDate.toDateString() === selectedDate.toDateString();
  });

  const handleExportPDF = () => {
    const transactionsToExport = filteredTransactions; if (transactionsToExport.length === 0) { alert("Không có dữ liệu giao dịch để xuất."); return; }
    const selectedCard = cards.find(card => card.account_id === selectedCardId); const doc = new jsPDF(); callAddFont.call(doc); doc.setFont('Roboto-Regular', 'normal');
    doc.setFontSize(18); doc.text("LICH SU GIAO DICH", 14, 22); doc.setFontSize(11); doc.setTextColor(100); doc.text(`Chu tai khoan: ${user?.full_name || 'N/A'}`, 14, 29); doc.text(`So the: ${selectedCard ? (selectedCard.CardNumber || selectedCard.cardNumber) : 'N/A'}`, 14, 36); doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 43);
    const tableColumn = ["Ngay", "Mo ta", "So tien (VND)", "Loai", "Trang thai"]; const tableRows = [];
    transactionsToExport.forEach(item => {
      const isPlus = item.transaction_type === 'Deposit' || item.transaction_type === 'Refund';
      const typeText = item.transaction_type === 'Deposit' ? 'Nhận tiền' : item.transaction_type === 'Refund' ? 'Hoàn tiền' : 'Trừ tiền';
      const transactionData = [new Date(item.transactionDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }), item.description, `${isPlus ? '+' : '-'}${formatCurrency(item.amount)}`, typeText, item.transaction_status || 'Thành công']; tableRows.push(transactionData);
    });
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 55, headStyles: { fillColor: [41, 128, 185], textColor: 255, font: 'Roboto-Regular', fontStyle: 'bold' }, styles: { font: 'Roboto-Regular', fontStyle: 'normal' }, alternateRowStyles: { fillColor: [245, 245, 245] }, });
    const safeUserName = user?.full_name?.replace(/[^a-zA-Z0-9]/g, '') || 'User'; doc.save(`LichSuGiaoDich_${safeUserName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ background: colors.background }}><Fade in={loading}><Box textAlign="center"><CircularProgress size={60} sx={{ color: colors.accent, mb: 2 }} /><Typography variant="h6" color={colors.textSecondary}>Đang tải dữ liệu...</Typography></Box></Fade></Box>);
  }

  if (error && !cards.length) {
    return (<Box sx={{ p: 3, background: colors.background, minHeight: '100vh' }}><Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert></Box>);
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <GlobalStyles styles={{ '._mainContent_b1piq_13': { marginLeft: '30px !important' }, 'html, body': { overflowY: 'scroll', backgroundColor: colors.background } }} />

      <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${colors.background} 0%, #e2e8f0 100%)`, p: 3 }}>
        <Fade in={true} timeout={600}><Paper elevation={0} sx={{ background: colors.gradientPrimary, borderRadius: 4, p: 4, mb: 4, color: 'white', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.05"%3E%3Cpath d="m0 40l40-40h-40v40zm40 0v40h-40l40-40z"/%3E%3C/g%3E%3C/svg%3E" )' } }}><Box sx={{ position: 'relative', zIndex: 1 }}><Stack direction="row" spacing={3} alignItems="center"><Avatar sx={{ width: 64, height: 64, background: colors.glassEffect, backdropFilter: 'blur(10px)', border: '2px solid rgba(255, 255, 255, 0.3)' }}><AccountBalanceWallet sx={{ fontSize: 32 }} /></Avatar><Box><Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>Xin chào, {user?.full_name?.toUpperCase()}!</Typography><Typography variant="body1" sx={{ opacity: 0.9 }}>Chào mừng bạn quay trở lại. Hãy cùng xem tình hình tài chính của bạn hôm nay.</Typography></Box></Stack></Box></Paper></Fade>
        
        <Fade in={true} timeout={800}><Box sx={{ mb: 4 }}>{cards.length > 0 ? cards.map((card) => { const isBalanceVisible = cardBalanceVisibility[card.account_id]; const isSelected = selectedCardId === card.account_id; return (<Paper key={card.account_id} elevation={0} onClick={() => setSelectedCardId(card.account_id)} sx={{ background: colors.cardGradient, borderRadius: 4, p: 4, color: 'white', position: 'relative', overflow: 'hidden', mb: 2, cursor: 'pointer', border: isSelected ? `3px solid ${colors.success}` : '3px solid transparent', transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', borderColor: isSelected ? colors.success : 'rgba(255,255,255,0.3)' }, '&::before': { content: '""', position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' } }}><Box sx={{ position: 'relative', zIndex: 1 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Stack direction="row" spacing={3} alignItems="center"><Avatar sx={{ width: 56, height: 56, background: colors.glassEffect, backdropFilter: 'blur(10px)', border: '2px solid rgba(255, 255, 255, 0.3)' }}><CreditCard sx={{ fontSize: 28 }} /></Avatar><Box><Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>{card.cardType === 'Normal' ? 'Tài khoản thanh toán' : 'Tài khoản tín dụng'}</Typography><Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.9, fontSize: '1.1rem', mb: 1 }}>{card.CardNumber || card.cardNumber}</Typography><Stack direction="row" spacing={1} alignItems="center"><Chip label={card.cardType === 'Normal' ? 'Thẻ thường' : 'Thẻ tín dụng'} size="small" sx={{ backgroundImage: card.cardType === 'Normal' ? 'linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%)' : 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', color: 'white', fontWeight: 'bold' }} /><Chip label={card.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'} size="small" sx={{ backgroundColor: card.status === 'Active' ? '#4CAF50' : '#F44336', color: 'white', fontWeight: 'bold' }} /></Stack></Box></Stack><Box textAlign="right"><Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>Số dư khả dụng</Typography><Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}><Typography variant="h4" fontWeight={700}>{isBalanceVisible ? formatCurrency(card.balance) : '******'} VND</Typography><Tooltip title={isBalanceVisible ? "Ẩn số dư" : "Hiện số dư"}><IconButton onClick={(e) => { e.stopPropagation(); toggleCardBalanceVisibility(card.account_id) }} sx={{ color: 'white', '&:hover': { backgroundColor: colors.glassEffect } }}>{isBalanceVisible ? <VisibilityOff /> : <Visibility />}</IconButton></Tooltip></Stack></Box></Stack></Box></Paper>); }) : (<Alert severity="info" sx={{ borderRadius: 3 }}>Không tìm thấy tài khoản nào.</Alert>)}</Box></Fade>
        
        <Fade in={true} timeout={1000}><Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', background: colors.surface, border: `1px solid ${colors.border}`, minHeight: '500px' }}>
            <Box sx={{ p: 3, background: `linear-gradient(90deg, ${colors.surface} 0%, ${colors.background} 100%)`, borderBottom: `1px solid ${colors.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ background: colors.gradientSuccess }}><TrendingUpRounded /></Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={600} color={colors.textPrimary}>Hoạt động gần đây</Typography>
                            <Typography variant="body2" color={colors.textSecondary}>{isFetchingTransactions ? 'Đang tải...' : `${filteredTransactions.length} giao dịch`}</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Tooltip title="Xuất danh sách giao dịch ra PDF"><IconButton onClick={handleExportPDF} sx={{ background: colors.gradientWarning, color: 'white', '&:hover': { transform: 'scale(1.1)', background: colors.gradientWarning } }}><PictureAsPdf /></IconButton></Tooltip>
                        <DatePicker label="Lọc theo ngày" value={selectedDate} onChange={(newValue) => setSelectedDate(newValue)} slotProps={{ textField: { size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2, background: colors.background } } }, inputAdornment: { position: 'end', children: selectedDate && (<IconButton size="small" onClick={() => setSelectedDate(null)} sx={{ marginRight: '-8px' }}><Clear /></IconButton>) } }} sx={{ width: '200px' }} />
                    </Stack>
                </Stack>
            </Box>
          <Box sx={{ p: 3, maxHeight: '600px', overflowY: 'auto', overflowX: 'hidden', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { backgroundColor: colors.background, borderRadius: '4px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: colors.textSecondary, borderRadius: '4px', '&:hover': { backgroundColor: colors.textPrimary } } }}>
            {isFetchingTransactions ? (<Box display="flex" justifyContent="center" alignItems="center" minHeight="300px"><CircularProgress /></Box>) : filteredTransactions.length > 0 ? (
              <Stack spacing={3}>
                {filteredTransactions.map((item, index) => {
                  const isRefund = item.transaction_type === 'Refund';
                  const isDeposit = item.transaction_type === 'Deposit';
                  
                  let avatarIcon, avatarBg, amountPrefix;

                  if (isRefund) {
                      avatarIcon = <ReplayCircleFilled />;
                      avatarBg = colors.gradientInfo;
                      amountPrefix = '+';
                  } else if (isDeposit) {
                      avatarIcon = <ArrowUpward />;
                      avatarBg = colors.gradientSuccess;
                      amountPrefix = '+';
                  } else { // Withdrawal
                      avatarIcon = <ArrowDownward />;
                      avatarBg = colors.gradientWarning;
                      amountPrefix = '-';
                  }

                  return (
                    <Fade key={item.transactionId || index} in={true} timeout={600 + index * 100}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 600, color: colors.textSecondary, mb: 1, display: 'block', letterSpacing: '0.5px' }}>{new Date(item.transactionDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Typography>
                        <Paper elevation={0} onClick={() => handleOpenDetailModal(item)} sx={{ cursor: 'pointer', borderRadius: 3, border: `1px solid ${colors.border}`, background: colors.surface, transition: 'all 0.3s ease', '&:hover': { transform: 'translateX(8px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', borderColor: colors.accent } }}>
                          <CardContent sx={{ p: '20px !important' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={3} alignItems="center">
                                <Avatar sx={{ width: 48, height: 48, background: avatarBg, color: 'white' }}>
                                  {avatarIcon}
                                </Avatar>
                                <Box> 
                                  <Typography variant="body1" fontWeight={600} color={colors.textPrimary} sx={{ mb: 0.5 }}>
                                      {item.description}
                                  </Typography>
                                  <Chip label={item.transaction_status || 'Thành công'} size="small" sx={{ background: colors.background, color: colors.textSecondary, fontWeight: 500 }} />
                                </Box>
                              </Stack>
                              <Chip label={`${amountPrefix}${formatCurrency(item.amount)}`} sx={{ background: avatarBg, color: 'white', fontWeight: 700, fontSize: '1rem', height: '36px', borderRadius: 2 }} />
                            </Stack>
                          </CardContent>
                        </Paper>
                      </Box>
                    </Fade>
                  );
                })}
              </Stack>
            ) : (<Box sx={{ textAlign: 'center', py: 8, color: colors.textSecondary }}><Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, background: colors.background, color: colors.textSecondary }}><AttachMoney sx={{ fontSize: 40 }} /></Avatar><Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Không có giao dịch nào</Typography><Typography variant="body2">{selectedDate ? `trong ngày ${selectedDate.toLocaleDateString('vi-VN')}` : 'cho thẻ này trong tháng này'}</Typography></Box>)}
          </Box>
        </Paper></Fade>
      </Box>

      <Dialog open={isDetailModalOpen} onClose={handleCloseDetailModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
            <ReceiptLong color="primary"/>
            Chi Tiết Giao Dịch
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Stack spacing={2}>
                <Box textAlign="center" my={2}>
                    <Typography 
                        variant="h4" 
                        fontWeight="bold"
                        color={selectedTransaction.transaction_type === 'Withdrawal' ? 'error.main' : 'success.main'}
                    >
                        {selectedTransaction.transaction_type === 'Withdrawal' ? '-' : '+'}{formatCurrency(selectedTransaction.amount)} VND
                    </Typography>
                    <Chip 
                        label={selectedTransaction.transaction_status || 'Thành công'} 
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                    />
                </Box>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Mã giao dịch</Typography><Typography fontWeight="500">{selectedTransaction.transactionId}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Thời gian</Typography><Typography fontWeight="500">{new Date(selectedTransaction.transactionDate).toLocaleString('vi-VN')}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Tài khoản nguồn</Typography><Typography fontWeight="500">{selectedTransaction.senderAccount}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Tài khoản hưởng</Typography><Typography fontWeight="500">{selectedTransaction.receiverAccount}</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Typography color="text.secondary">Nội dung</Typography><Typography fontWeight="500" textAlign="right" sx={{ maxWidth: '70%' }}>{selectedTransaction.description}</Typography></Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default Home;