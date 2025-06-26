import React, { useState } from 'react';
import {  Box,  Paper,  Typography,  TextField,  Button,  FormControl,  FormLabel,  RadioGroup,  FormControlLabel, Radio,  Switch,  Divider,  Grid,  Card,  CardContent,  Alert,  CircularProgress,  InputAdornment,  IconButton} from '@mui/material';import {
  ContentCopy,  AccountBalance,  Person,  Phone,  AttachMoney} from '@mui/icons-material';
const BankTransferPage = () => {
  const [formData, setFormData] = useState({
    beneficiaryBank: 'MB',
    beneficiaryBankName: 'Ngân hàng TMCP Quân Đội',
    transferType: 'fast',
    accountNumber: '0375962328',
    beneficiaryName: 'VU THIEN HAU',
    saveRecipient: true,
    fromAccount: '1907190630037',
    amount: '20000',
    transferNote: 'Chuyen tien'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // API call example - replace with your actual API endpoint
      const response = await fetch('/api/bank-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // if using auth
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Chuyển tiền thành công!');
        // Reset form or redirect as needed
      } else {
        setError(result.message || 'Có lỗi xảy ra khi chuyển tiền');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Transfer error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Chuyển tiền tới ngân hàng khác
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Ngân hàng thụ hưởng */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Ngân hàng thụ hưởng
            </Typography>
            <TextField
              fullWidth
              value={`${formData.beneficiaryBank} - ${formData.beneficiaryBankName}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalance color="action" />
                  </InputAdornment>
                )
              }}
              variant="outlined"
              disabled
            />
          </Box>

          {/* Lựa chọn phương thức chuyển tiền */}
          <Box sx={{ mb: 3 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Lựa chọn phương thức chuyển tiền
              </FormLabel>
              <RadioGroup
                row
                value={formData.transferType}
                onChange={handleInputChange('transferType')}
              >
                <FormControlLabel
                  value="fast"
                  control={<Radio />}
                  label="Chuyển nhanh Napas 24/7"
                />
                <FormControlLabel
                  value="normal"
                  control={<Radio />}
                  label="Chuyển thường Liên ngân hàng"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Số tài khoản */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Số tài khoản
            </Typography>
            <TextField
              fullWidth
              value={formData.accountNumber}
              onChange={handleInputChange('accountNumber')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => copyToClipboard(formData.accountNumber)}
                      size="small"
                    >
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              variant="outlined"
            />
          </Box>

          {/* Tên người nhận */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tên người nhận
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                fullWidth
                value={formData.beneficiaryName}
                onChange={handleInputChange('beneficiaryName')}
                variant="outlined"
                sx={{ flexGrow: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.saveRecipient}
                    onChange={handleInputChange('saveRecipient')}
                  />
                }
                label="Lưu người nhận"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* From Account */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Từ
            </Typography>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tài khoản thanh toán
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {formData.fromAccount}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    VND 95,245
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Số tiền */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Số tiền
              </Typography>
              <TextField
                fullWidth
                value={formData.amount}
                onChange={handleInputChange('amount')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">VND</InputAdornment>,
                }}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'end', height: '100%' }}>
                <Typography variant="body1" sx={{ pb: 1 }}>
                  20,000
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Lời nhắn */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Lời nhắn
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.transferNote}
              onChange={handleInputChange('transferNote')}
              variant="outlined"
              placeholder="Nhập lời nhắn (tùy chọn)"
            />
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                minWidth: 200,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Đang xử lý...
                </>
              ) : (
                'Tiếp tục'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default BankTransferPage;