import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  useTheme,
  GlobalStyles,
} from '@mui/material';
import {
  Cancel,
  ChevronRight,
} from '@mui/icons-material';

// --- Bảng màu từ CheckRequest ---
const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const CancelCheckPayment = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    accountNumber: '1907 1903 0300 17',
    checkNumber: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Danh sách tài khoản thanh toán mẫu
  const accounts = [
    { number: '1907 1903 0300 17', name: 'Tài khoản chính' },
    { number: '1907 1903 0300 18', name: 'Tài khoản phụ 1' },
    { number: '1907 1903 0300 19', name: 'Tài khoản phụ 2' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (name === 'termsAccepted' && checked) {
      setError('');
    }
  };

  const handleSubmit = () => {
    if (!formData.termsAccepted) {
      setError('Vui lòng xác nhận điều khoản trước khi gửi yêu cầu.');
      return;
    }
    if (!formData.checkNumber) {
      setError('Vui lòng nhập số séc cần hủy.');
      return;
    }
    // Xử lý gửi yêu cầu hủy (chưa implement logic thật)
    console.log('Yêu cầu hủy séc:', formData);
    setOpenSnackbar(true);
    setError('');
    // Reset form sau khi gửi
    setFormData({
      accountNumber: '1907 1903 0300 17',
      checkNumber: '',
      termsAccepted: false,
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      {/* Override class bên ngoài */}
      <GlobalStyles
        styles={{
          '._mainContent_b1piq_13': {
            marginLeft: '30px !important',
            marginTop: '30px !important',
          },
          'html, body': {
            overflow: 'auto',
            backgroundColor: '#fff',
          },
        }}
      />

      {/* Main container */}
      <Box
        sx={{
          p: 3,
          backgroundColor: '#ffffff',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight={700} color={primaryBlack}>
            Hủy thanh toán bằng séc
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>VH</Avatar>
        </Box>

        {/* Form Card */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 2,
            backgroundColor: lightGray,
            boxShadow: theme.shadows[1],
            borderLeft: `4px solid ${primaryBlack}`,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600} color={primaryBlack}>
                Thông tin yêu cầu hủy
              </Typography>
              <Button
                variant="text"
                endIcon={<ChevronRight fontSize="small" />}
                sx={{ textTransform: 'none', color: primaryBlack }}
              >
                Xem lịch sử hủy
              </Button>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: exceptionGreen, color: '#fff' }}>
                  <Cancel />
                </Avatar>
                <TextField
                  select
                  label="Tài khoản thanh toán"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  fullWidth
                  sx={{ bgcolor: '#fff' }}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.number} value={account.number}>
                      {account.name} ({account.number})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                label="Số séc"
                name="checkNumber"
                value={formData.checkNumber}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: '#fff' }}
                placeholder="Nhập số séc cần hủy (VD: CHK123456)"
              />

              {/* Thông báo lưu ý */}
              <Box
                sx={{
                  bgcolor: '#fff',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${mediumGray}`,
                }}
              >
                <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                  Lưu ý khi hủy séc
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Vui lòng nhập chính xác số séc cần hủy.
                  <br />
                  - Sau khi hủy, séc sẽ không thể sử dụng để thanh toán.
                  <br />
                  - Liên hệ ngân hàng nếu bạn cần hỗ trợ thêm.
                </Typography>
              </Box>

              {/* Xác nhận điều khoản */}
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    sx={{
                      color: primaryBlack,
                      '&.Mui-checked': {
                        color: exceptionGreen,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color={primaryBlack}>
                    Tôi xác nhận thông tin cung cấp là chính xác và đồng ý với điều khoản hủy séc.
                  </Typography>
                }
              />

              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button
            variant="outlined"
            sx={{
              borderColor: primaryBlack,
              color: primaryBlack,
              borderRadius: 5,
              textTransform: 'none',
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.termsAccepted || !formData.checkNumber}
            sx={{
              backgroundColor: primaryBlack,
              '&:hover': {
                backgroundColor: '#000',
              },
              borderRadius: 5,
              textTransform: 'none',
            }}
          >
            Gửi yêu cầu hủy
          </Button>
        </Box>

        {/* Snackbar thông báo gửi thành công */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: '100%', bgcolor: exceptionGreen, color: '#fff' }}
          >
            Yêu cầu hủy séc đã được gửi thành công!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default CancelCheckPayment;