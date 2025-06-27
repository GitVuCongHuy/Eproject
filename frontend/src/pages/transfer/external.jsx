import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Switch, Divider, Grid, Card, CardContent, Alert, CircularProgress, InputAdornment,
  IconButton, GlobalStyles,
  // Thêm các component cho dropdown
  Select, MenuItem, InputLabel
} from '@mui/material';
import { ContentCopy, AccountBalance, Person } from '@mui/icons-material';
import { useLocation } from 'react-router-dom'; // <<< 1. Import useLocation để nhận data
import { useAuth } from '../../context/context';     // <<< 2. Import useAuth để gọi API

const BankTransferPage = () => {
  const location = useLocation();
  const { getCards } = useAuth();

  const { cardNumber, beneficiaryName } = location.state || {};

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchFromAccounts = async () => {
      setLoadingAccounts(true);
      const result = await getCards();
      if (result.success && result.data.length > 0) {
        setFromAccounts(result.data);
        setSelectedAccount(result.data[0].account_id);
      } else {
        setError('Lỗi: không thể tải danh sách tài khoản của bạn.');
      }
      setLoadingAccounts(false);
    };

    if (!cardNumber) {
      setError("Không có thông tin người nhận. Vui lòng quay lại và thử lại.");
      setLoadingAccounts(false);
    } else {
      fetchFromAccounts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectAccount = (event) => {
    setSelectedAccount(event.target.value);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    console.log("Submitting form with data:", { ...formData, fromAccount: selectedAccount });
    // Ở đây bạn sẽ gọi API chuyển tiền thật sự
    // ...
    // Giả lập API call
    setTimeout(() => {
      if (formData.amount > currentAccountDetails.balance) {
        setError("Số dư không đủ để thực hiện giao dịch.");
      } else {
        setSuccess('Chuyển tiền thành công!');
      }
      setLoading(false);
    }, 1500);
  };

  const currentAccountDetails = fromAccounts.find(acc => acc.account_id === selectedAccount);

  return (
    <>
      <GlobalStyles styles={{ '._mainContent_b1piq_13': { marginLeft: '30px !important', marginTop: '30px!important', }, 'html, body': { overflow: 'y', backgroundColor: '#fff', }, }} />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Chuyển tiền tới ngân hàng khác
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Ngân hàng thụ hưởng </Typography>
              <TextField fullWidth value={`${formData.beneficiaryBank} - ${formData.beneficiaryBankName}`} InputProps={{ startAdornment: ( <InputAdornment position="start"> <AccountBalance color="action" /> </InputAdornment> ) }} variant="outlined" disabled />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 1, color: 'text.secondary' }}> Lựa chọn phương thức chuyển tiền </FormLabel>
                <RadioGroup row value={formData.transferType} onChange={handleInputChange('transferType')}>
                  <FormControlLabel value="fast" control={<Radio />} label="Chuyển nhanh Napas 24/7" />
                  <FormControlLabel value="normal" control={<Radio />} label="Chuyển thường" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Số tài khoản người nhận </Typography>
              <TextField fullWidth value={formData.accountNumber} InputProps={{ startAdornment: ( <InputAdornment position="start"> <Person color="action" /> </InputAdornment> ), endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => copyToClipboard(formData.accountNumber)} size="small"> <ContentCopy /> </IconButton> </InputAdornment> ), readOnly: true, }} variant="outlined" />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Tên người nhận </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField fullWidth value={formData.beneficiaryName} variant="outlined" sx={{ flexGrow: 1 }} InputProps={{ readOnly: true }} />
                <FormControlLabel control={ <Switch checked={formData.saveRecipient} onChange={handleInputChange('saveRecipient')} /> } label="Lưu người nhận" />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Từ tài khoản </Typography>
              {loadingAccounts ? ( <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}> <CircularProgress size={24} /> <Typography>Đang tải tài khoản của bạn...</Typography> </Box> ) : 
              fromAccounts.length > 0 ? (
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={7}>
                        <FormControl fullWidth variant="standard" sx={{ border: 'none', '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' }, '& .MuiInput-underline:after': { borderBottom: 'none' } }}>
                          <Select value={selectedAccount} onChange={handleSelectAccount}>
                            {fromAccounts.map((acc) => (
                              <MenuItem key={acc.account_id} value={acc.account_id}>
                                <ListItemText primary="Tài khoản thanh toán" secondary={acc.cardNumber} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', textAlign: { sm: 'right', xs: 'left' } }}>
                          {currentAccountDetails && `VND ${currentAccountDetails.balance.toLocaleString('vi-VN')}`}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                <Alert severity="warning">Không tìm thấy tài khoản thanh toán nào.</Alert>
              )}
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Số tiền </Typography>
                <TextField fullWidth value={formData.amount} onChange={handleInputChange('amount')} InputProps={{ startAdornment: <InputAdornment position="start">VND</InputAdornment>, }} variant="outlined" type="number" required />
              </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Lời nhắn </Typography>
              <TextField fullWidth multiline rows={2} value={formData.transferNote} onChange={handleInputChange('transferNote')} variant="outlined" placeholder="Nhập lời nhắn (tùy chọn)" />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="submit" variant="contained" size="large" disabled={loading || loadingAccounts || !currentAccountDetails} sx={{ minWidth: 200, py: 1.5, borderRadius: 3, textTransform: 'none', fontSize: '1.1rem' }}>
                {loading ? ( <> <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> Đang xử lý... </> ) : ( 'Tiếp tục' )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default BankTransferPage;