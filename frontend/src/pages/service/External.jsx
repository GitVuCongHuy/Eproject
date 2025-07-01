import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Switch, Divider, Grid, Card, CardContent, Alert, CircularProgress, InputAdornment,
  IconButton, GlobalStyles, Select, MenuItem, InputLabel, ListItemText,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fade, Grow, Slide,
  Chip, Avatar, Stack, Container, useTheme
} from '@mui/material';
import { 
  ContentCopy, Person, AccountBalance, AttachMoney, Message, 
  CheckCircle, Security, Sms, ArrowForward, CelebrationOutlined,
  Send, AccountBalanceWallet, Info
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Context';

const BankTransferPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const { getCards, bankTransfer, checkTransactionPassword, sendOTP, verifyOTP, getCustomerAccount } = useAuth();

  const { cardNumber, beneficiaryName } = location.state || {};
  
  const [senderName, setSenderName] = useState('');
  const [fromAccounts, setFromAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [formData, setFormData] = useState({
    beneficiaryBank: 'MB',
    beneficiaryBankName: 'Ngân hàng TMCP Quân Đội',
    transferType: 'fast',
    accountNumber: cardNumber || '',
    beneficiaryName: beneficiaryName || '',
    saveRecipient: true,
    amount: '',
    transferNote: ''
  });
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  // State mới cho thông báo thành công
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [amountError, setAmountError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingAccounts(true);
      const cardsResult = await getCards();
      
      if (cardsResult.success && Array.isArray(cardsResult.data) && cardsResult.data.length > 0) {
        const userAccounts = cardsResult.data;
        const defaultAccount = userAccounts[0];
        
        setFromAccounts(userAccounts);
        setSelectedAccount(defaultAccount.account_id);
        setError('');
        
        if (defaultAccount.cardNumber) {
          const nameResult = await getCustomerAccount(defaultAccount.cardNumber);
          if (nameResult.success) {
            setSenderName(nameResult.data.name_customer); 
          }
        }
      } else {
        setError(cardsResult.message || 'Lỗi: không thể tải danh sách tài khoản của bạn.');
      }
      setLoadingAccounts(false);
    };
    fetchInitialData();
  }, [getCards, getCustomerAccount]);

  useEffect(() => {
    if (senderName) {
      setFormData(prev => ({
        ...prev,
        transferNote: `${senderName} chuyen tien`
      }));
    }
  }, [senderName]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'amount') {
      setAmountError('');
    }
  };
  
  const handleSelectAccount = (event) => { setSelectedAccount(event.target.value); };
  
  const copyToClipboard = (text) => { 
    navigator.clipboard.writeText(text);
    // Có thể thêm snackbar thông báo copy thành công
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setAmountError('');
    setError('');
    setSuccess('');

    const amount = Number(formData.amount);
    const currentAccountDetails = fromAccounts.find(acc => acc.account_id === selectedAccount);
    
    // Thêm kiểm tra an toàn nếu không tìm thấy tài khoản
    if (!currentAccountDetails) {
        setError("Không thể xác định tài khoản nguồn. Vui lòng tải lại trang.");
        return;
    }
    
    const currentBalance = currentAccountDetails.balance;
    
    // Định nghĩa hạn mức giao dịch tối đa
    const MAX_TRANSFER_LIMIT = 50000000; // 50 triệu VND

    // Kiểm tra 1: Số tiền tối thiểu
    if (!amount || amount < 1000) {
        setAmountError("Số tiền không hợp lệ. Vui lòng nhập số tiền từ 1,000 VND trở lên.");
        return; 
    }

    // Kiểm tra 2: Số tiền có vượt quá hạn mức tối đa không
    if (amount > MAX_TRANSFER_LIMIT) {
        setAmountError(`Số tiền vượt quá hạn mức cho phép. Tối đa ${MAX_TRANSFER_LIMIT.toLocaleString('vi-VN')} VND mỗi giao dịch.`);
        return;
    }

    // Kiểm tra 3: Số tiền có vượt quá số dư hiện có không
    if (amount > currentBalance) {
        setAmountError(`Số tiền chuyển vượt quá số dư hiện có (${currentBalance.toLocaleString('vi-VN')} VND).`);
        return; 
    }
    
    // Nếu tất cả kiểm tra đều qua, mở modal
    setModalStep(1);
    setIsConfirmModalOpen(true);
  };

  const handleCloseModal = () => { 
    setIsConfirmModalOpen(false); 
    setTimeout(() => { 
      setModalStep(1); 
      setTransactionPassword(''); 
      setOtp(''); 
      setModalError(''); 
      setIsModalLoading(false); 
    }, 300); 
  };

  const handlePasswordSubmit = async () => { 
    setIsModalLoading(true); 
    setModalError(''); 
    const result = await checkTransactionPassword(Number(transactionPassword)); 
    if(result.success) { 
      await sendOTP(); 
      setModalStep(2); 
    } else { 
      setModalError(result.message || "Mật khẩu giao dịch không chính xác."); 
    } 
    setIsModalLoading(false); 
  };

  const handleFinalSubmit = async () => { 
    setIsModalLoading(true); 
    setModalError(''); 
    const otpResult = await verifyOTP(otp); 
    if(!otpResult.success) { 
      setModalError(otpResult.message || "Mã OTP không hợp lệ."); 
      setIsModalLoading(false); 
      return; 
    } 
    
    const senderCard = fromAccounts.find(acc => acc.account_id === selectedAccount); 
    const transferDetails = { 
      senderAccount: senderCard.cardNumber, 
      receiverAccount: formData.accountNumber, 
      amount: Number(formData.amount), 
      description: formData.transferNote || `${senderName} chuyen tien`, 
      transactionPassword: Number(transactionPassword) 
    }; 
    
    const transferResponse = await bankTransfer(transferDetails); 
    if(transferResponse.success) { 
      // Lưu thông tin giao dịch để hiển thị trong modal thành công
      setTransferResult({
        senderName: senderName,
        senderAccount: senderCard.cardNumber,
        beneficiaryName: formData.beneficiaryName,
        beneficiaryAccount: formData.accountNumber,
        amount: Number(formData.amount),
        transferNote: formData.transferNote,
        transactionId: transferResponse.transactionId || `TXN${Date.now()}`,
        timestamp: new Date().toLocaleString('vi-VN')
      });
      
      handleCloseModal(); 
      setIsSuccessModalOpen(true);
    } else { 
      setError(transferResponse.message || "Giao dịch không thành công. Vui lòng thử lại."); 
      handleCloseModal(); 
    } 
    setIsModalLoading(false); 
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setTimeout(() => navigate('/'), 1000);
  };

  const currentAccountDetails = fromAccounts.find(acc => acc.account_id === selectedAccount);

  return (
    <>
      <GlobalStyles styles={{ 
        '._mainContent_b1piq_13': { 
          marginLeft: '10px !important', 
          marginTop: '10px!important', 
        }, 
        'html, body': { 
          overflow: 'scroll', 
          backgroundColor: '#f8fafc', 
        },
        // Custom scrollbar
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        }
      }} />
      
      <Container maxWidth="100vw" sx={{ py: 4 }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Send sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Chuyển tiền tức thì
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Chuyển tiền nhanh chóng, an toàn và bảo mật với công nghệ hiện đại
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }}
        >
          {error && (
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 24 }
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}
          
          {success && (
            <Fade in={!!success}>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { fontSize: 24 }
                }}
              >
                {success}
              </Alert>
            </Fade>
          )}

          <form onSubmit={handleSubmit}>
            {/* Thông tin người nhận */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Thông tin người nhận
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Số tài khoản người nhận
                    </Typography>
                    <TextField 
                      fullWidth 
                      value={formData.accountNumber} 
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountBalance color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => copyToClipboard(formData.accountNumber)} size="small">
                              <ContentCopy />
                            </IconButton>
                          </InputAdornment>
                        ),
                        readOnly: true,
                      }} 
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'grey.50'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Tên người nhận
                    </Typography>
                    <TextField 
                      fullWidth 
                      value={formData.beneficiaryName} 
                      variant="outlined" 
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'grey.50'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    icon={<AccountBalance />} 
                    label={formData.beneficiaryBankName} 
                    color="primary" 
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Tài khoản nguồn */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'success.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    Tài khoản nguồn
                  </Typography>
                </Stack>
                
                {loadingAccounts ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                    <CircularProgress size={24} />
                    <Typography>Đang tải tài khoản...</Typography>
                  </Box>
                ) : fromAccounts.length > 0 ? (
                  <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'success.50' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="from-account-select-label">Chọn tài khoản nguồn</InputLabel>
                            <Select 
                              labelId="from-account-select-label" 
                              value={selectedAccount} 
                              onChange={handleSelectAccount} 
                              label="Chọn tài khoản nguồn"
                              sx={{ borderRadius: 2 }}
                            >
                              {fromAccounts.map((acc) => (
                                <MenuItem key={acc.account_id} value={acc.account_id}>
                                  <ListItemText 
                                    primary={`Tài khoản thanh toán - ${acc.cardNumber}`} 
                                    secondary={`Số dư: ${acc.balance.toLocaleString('vi-VN')} VND`} 
                                  />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          {currentAccountDetails && (
                            <Paper 
                              sx={{ 
                                p: 2, 
                                textAlign: 'center', 
                                bgcolor: 'success.main', 
                                color: 'white',
                                borderRadius: 2
                              }}
                            >
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Số dư khả dụng
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {currentAccountDetails.balance.toLocaleString('vi-VN')} VND
                              </Typography>
                            </Paper>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ) : null}
              </CardContent>
            </Card>

            {/* Thông tin giao dịch */}
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'warning.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    Chi tiết giao dịch
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Số tiền chuyển
                    </Typography>
                    <TextField 
                      fullWidth 
                      value={formData.amount} 
                      onChange={handleInputChange('amount')} 
                      InputProps={{ 
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney color="warning" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">VND</InputAdornment> 
                      }} 
                      variant="outlined" 
                      type="number" 
                      required 
                      error={!!amountError} 
                      helperText={amountError}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Phí giao dịch
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid', 
                      borderColor: 'success.light',
                      borderRadius: 2,
                      bgcolor: 'success.50',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CheckCircle color="success" fontSize="small" />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        MIỄN PHÍ
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Lời nhắn
                    </Typography>
<TextField
  multiline
  rows={1}
  value={formData.transferNote}
  onChange={handleInputChange('transferNote')}
  variant="outlined"
  placeholder="Nhập lời nhắn cho người nhận (tùy chọn)"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
        <Message color="info" />
      </InputAdornment>
    ),
  }}
  sx={{
    width: '300px', // 👈 tuỳ chỉnh width theo ý bạn (có thể là 300, 400, 'auto', '60%'...)
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      overflow: 'hidden', // 👈 quan trọng để tránh scroll
      paddingRight: 1,
    },
    '& .MuiInputBase-inputMultiline': {
      overflow: 'hidden', // 👈 không cho hiện scroll
    },
  }}
/>

                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loadingAccounts || !currentAccountDetails || !!success} 
                endIcon={<ArrowForward />}
                sx={{ 
                  minWidth: 250, 
                  py: 2, 
                  borderRadius: 3, 
                  textTransform: 'none', 
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)',
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                Xác nhận chuyển tiền
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>

      {/* Modal xác nhận giao dịch */}
      <Dialog 
        open={isConfirmModalOpen} 
        onClose={handleCloseModal} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }
        }}
      >
        {modalStep === 1 ? (
          <>
            <DialogTitle sx={{ 
              fontWeight: 'bold', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Security />
              Xác thực bảo mật
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <DialogContentText sx={{ textAlign: 'center', mb: 3, fontSize: '1.1rem' }}>
                Để đảm bảo an toàn giao dịch, vui lòng nhập mật khẩu giao dịch của bạn.
              </DialogContentText>
              <TextField 
                autoFocus 
                margin="dense" 
                id="transactionPassword" 
                label="Mật khẩu giao dịch" 
                type="password" 
                fullWidth 
                variant="outlined" 
                value={transactionPassword} 
                onChange={(e) => setTransactionPassword(e.target.value)} 
                error={!!modalError} 
                helperText={modalError} 
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={handleCloseModal} 
                disabled={isModalLoading}
                variant="outlined"
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                Hủy
              </Button>
              <Button 
                onClick={handlePasswordSubmit} 
                variant="contained" 
                disabled={isModalLoading || !transactionPassword}
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                {isModalLoading ? <CircularProgress size={24} /> : "Xác nhận"}
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle sx={{ 
              fontWeight: 'bold', 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Sms />
              Xác thực OTP
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <DialogContentText sx={{ textAlign: 'center', mb: 3, fontSize: '1.1rem' }}>
                Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã để hoàn tất giao dịch.
              </DialogContentText>
              
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.light' }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  Chi tiết giao dịch:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Người nhận:</strong> {formData.beneficiaryName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Số tài khoản:</strong> {formData.accountNumber}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    <strong>Số tiền:</strong> {Number(formData.amount).toLocaleString('vi-VN')} VND
                  </Typography>
                </Stack>
              </Paper>
              
              <TextField 
                autoFocus 
                margin="dense" 
                id="otp" 
                label="Mã OTP" 
                type="text" 
                fullWidth 
                variant="outlined" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                error={!!modalError} 
                helperText={modalError} 
                onKeyPress={(e) => e.key === 'Enter' && handleFinalSubmit()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={handleCloseModal} 
                disabled={isModalLoading}
                variant="outlined"
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                variant="contained" 
                disabled={isModalLoading || !otp}
                sx={{ borderRadius: 2, minWidth: 150 }}
              >
                {isModalLoading ? <CircularProgress size={24} /> : "Hoàn tất giao dịch"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal thành công */}
      <Dialog 
        open={isSuccessModalOpen} 
        onClose={handleCloseSuccessModal}
        maxWidth="md" 
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center',
          position: 'relative'
        }}>
          <CelebrationOutlined sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            🎉 Chúc mừng!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Giao dịch đã được thực hiện thành công
          </Typography>
          
          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'pulse 2s infinite'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: 15,
            left: 15,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'pulse 2s infinite 0.5s'
          }} />
        </Box>

        <DialogContent sx={{ p: 4 }}>
          {transferResult && (
            <Box>
              {/* Thông tin giao dịch */}
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                border: '2px solid',
                borderColor: 'success.light'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  mb: 3, 
                  color: 'success.dark',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <CheckCircle />
                  Chi tiết giao dịch
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'white' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Người gửi
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {transferResult.senderName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transferResult.senderAccount}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'white' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Người nhận
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        {transferResult.beneficiaryName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transferResult.beneficiaryAccount}
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Số tiền đã chuyển
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: 'success.main',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {transferResult.amount.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Card>
                  </Grid>
                  
                  {transferResult.transferNote && (
                    <Grid item xs={12}>
                      <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Lời nhắn
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                          "{transferResult.transferNote}"
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Thông tin bổ sung */}
              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
                border: '1px solid',
                borderColor: 'primary.light'
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Thông tin bổ sung
                  </Typography>
                  <Chip 
                    icon={<Info />} 
                    label="Hoàn thành" 
                    color="success" 
                    size="small"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Mã giao dịch
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {transferResult.transactionId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Thời gian thực hiện
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {transferResult.timestamp}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phí giao dịch
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      MIỄN PHÍ
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Thành công
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Lời cảm ơn */}
              <Box sx={{ 
                textAlign: 'center', 
                mt: 3, 
                p: 3,
                background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'warning.light'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.3rem'
                }}>
                  ✨ Cảm ơn bạn đã sử dụng dịch vụ! ✨
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Giao dịch đã được xử lý thành công. Tiền sẽ được chuyển đến tài khoản người nhận trong vài phút.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'primary.main' }}>
                  💝 Chúc bạn có một ngày tuyệt vời! 💝
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={handleCloseSuccessModal}
            variant="contained"
            size="large"
            startIcon={<CheckCircle />}
            sx={{
              minWidth: 200,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 10px 4px rgba(76, 175, 80, .3)',
              },
              transition: 'all 0.3s ease-in-out'
            }}
          >
            Hoàn tất
          </Button>
        </DialogActions>

        {/* Custom styles for animations */}
        <style jsx>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </Dialog>
    </>
  );
};

export default BankTransferPage;