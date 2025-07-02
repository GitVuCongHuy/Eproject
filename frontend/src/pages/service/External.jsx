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
    beneficiaryBankName: 'MB Commercial Joint Stock Bank',
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
        setError(cardsResult.message || 'Error: could not load your account list.');
      }
      setLoadingAccounts(false);
    };
    fetchInitialData();
  }, [getCards, getCustomerAccount]);

  useEffect(() => {
    if (senderName) {
      setFormData(prev => ({
        ...prev,
        transferNote: `${senderName} transfers money`
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAmountError('');
    setError('');
    setSuccess('');

    const amount = Number(formData.amount);
    const currentAccountDetails = fromAccounts.find(acc => acc.account_id === selectedAccount);
    
    if (!currentAccountDetails) {
        setError("Could not identify the source account. Please reload the page.");
        return;
    }
    
    const currentBalance = currentAccountDetails.balance;
    const MAX_TRANSFER_LIMIT = 50000000;

    if (!amount || amount < 1000) {
        setAmountError("Invalid amount. Please enter an amount of 1,000 VND or more.");
        return; 
    }

    if (amount > MAX_TRANSFER_LIMIT) {
        setAmountError(`Amount exceeds the allowed limit. Maximum of ${MAX_TRANSFER_LIMIT.toLocaleString('en-US')} VND per transaction.`);
        return;
    }

    if (amount > currentBalance) {
        setAmountError(`Transfer amount exceeds the available balance (${currentBalance.toLocaleString('en-US')} VND).`);
        return; 
    }
    
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
      setModalError(result.message || "Incorrect transaction password."); 
    } 
    setIsModalLoading(false); 
  };

  const handleFinalSubmit = async () => { 
    setIsModalLoading(true); 
    setModalError(''); 
    const otpResult = await verifyOTP(otp); 
    if(!otpResult.success) { 
      setModalError(otpResult.message || "Invalid OTP code."); 
      setIsModalLoading(false); 
      return; 
    } 
    
    const senderCard = fromAccounts.find(acc => acc.account_id === selectedAccount); 
    const transferDetails = { 
      senderAccount: senderCard.cardNumber, 
      receiverAccount: formData.accountNumber, 
      amount: Number(formData.amount), 
      description: formData.transferNote || `${senderName} transfers money`, 
      transactionPassword: Number(transactionPassword) 
    }; 
    
    const transferResponse = await bankTransfer(transferDetails); 
    if(transferResponse.success) { 
      setTransferResult({
        senderName: senderName,
        senderAccount: senderCard.cardNumber,
        beneficiaryName: formData.beneficiaryName,
        beneficiaryAccount: formData.accountNumber,
        amount: Number(formData.amount),
        transferNote: formData.transferNote,
        transactionId: transferResponse.transactionId || `TXN${Date.now()}`,
        timestamp: new Date().toLocaleString('en-US')
      });
      
      handleCloseModal(); 
      setIsSuccessModalOpen(true);
    } else { 
      setError(transferResponse.message || "Transaction failed. Please try again."); 
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
                Instant Money Transfer
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Transfer money quickly, safely, and securely with modern technology
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
            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Recipient Information
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Recipient Account Number
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
                      Recipient Name
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

            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'success.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    Source Account
                  </Typography>
                </Stack>
                
                {loadingAccounts ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                    <CircularProgress size={24} />
                    <Typography>Loading accounts...</Typography>
                  </Box>
                ) : fromAccounts.length > 0 ? (
                  <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'success.50' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <FormControl fullWidth variant="outlined">
                            <InputLabel id="from-account-select-label">Select source account</InputLabel>
                            <Select 
                              labelId="from-account-select-label" 
                              value={selectedAccount} 
                              onChange={handleSelectAccount} 
                              label="Select source account"
                              sx={{ borderRadius: 2 }}
                            >
                              {fromAccounts.map((acc) => (
                                <MenuItem key={acc.account_id} value={acc.account_id}>
                                  <ListItemText 
                                    primary={`Payment Account - ${acc.cardNumber}`} 
                                    secondary={`Balance: ${acc.balance.toLocaleString('en-US')} VND`} 
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
                                Available Balance
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {currentAccountDetails.balance.toLocaleString('en-US')} VND
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

            <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'warning.light' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <AttachMoney />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    Transaction Details
                  </Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Transfer Amount
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
                      Transaction Fee
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
                        FREE
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 600 }}>
                      Message
                    </Typography>
                    <TextField
                      multiline
                      rows={1}
                      value={formData.transferNote}
                      onChange={handleInputChange('transferNote')}
                      variant="outlined"
                      placeholder="Enter a message for the recipient (optional)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <Message color="info" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: '300px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          overflow: 'hidden',
                          paddingRight: 1,
                        },
                        '& .MuiInputBase-inputMultiline': {
                          overflow: 'hidden',
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
                Confirm Transfer
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>

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
              Security Authentication
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <DialogContentText sx={{ textAlign: 'center', mb: 3, fontSize: '1.1rem' }}>
                To ensure transaction security, please enter your transaction password.
              </DialogContentText>
              <TextField 
                autoFocus 
                margin="dense" 
                id="transactionPassword" 
                label="Transaction Password" 
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
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordSubmit} 
                variant="contained" 
                disabled={isModalLoading || !transactionPassword}
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                {isModalLoading ? <CircularProgress size={24} /> : "Confirm"}
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
              OTP Verification
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <DialogContentText sx={{ textAlign: 'center', mb: 3, fontSize: '1.1rem' }}>
                An OTP code has been sent to your email. Please check and enter the code to complete the transaction.
              </DialogContentText>
              
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.light' }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  Transaction Details:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Recipient:</strong> {formData.beneficiaryName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Account Number:</strong> {formData.accountNumber}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    <strong>Amount:</strong> {Number(formData.amount).toLocaleString('en-US')} VND
                  </Typography>
                </Stack>
              </Paper>
              
              <TextField 
                autoFocus 
                margin="dense" 
                id="otp" 
                label="OTP Code" 
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
                Cancel
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                variant="contained" 
                disabled={isModalLoading || !otp}
                sx={{ borderRadius: 2, minWidth: 150 }}
              >
                {isModalLoading ? <CircularProgress size={24} /> : "Complete Transaction"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
            🎉 Congratulations!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            The transaction has been completed successfully
          </Typography>
          
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
                  Transaction Details
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, height: '100%', borderRadius: 2, bgcolor: 'white' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Sender
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
                        Recipient
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
                        Amount Transferred
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: 'success.main',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {transferResult.amount.toLocaleString('en-US')} VND
                      </Typography>
                    </Card>
                  </Grid>
                  
                  {transferResult.transferNote && (
                    <Grid item xs={12}>
                      <Card sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Message
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                          "{transferResult.transferNote}"
                        </Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              <Paper sx={{ 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
                border: '1px solid',
                borderColor: 'primary.light'
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Additional Information
                  </Typography>
                  <Chip 
                    icon={<Info />} 
                    label="Completed" 
                    color="success" 
                    size="small"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Transaction ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {transferResult.transactionId}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Time
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {transferResult.timestamp}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Fee
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      FREE
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      Successful
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

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
                  ✨ Thank you for using our service! ✨
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  The transaction has been processed successfully. The money will be transferred to the recipient's account in a few minutes.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'primary.main' }}>
                  💝 Have a great day! 💝
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
            Done
          </Button>
        </DialogActions>

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