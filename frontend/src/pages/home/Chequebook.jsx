import React, { useState } from 'react';
import {  Box,  Typography,  Card,  CardContent,  Button,  Avatar,  TextField,  MenuItem,  FormControlLabel,  Checkbox,  useTheme,  GlobalStyles,} from '@mui/material';
import {  RequestPage,  ChevronRight} from '@mui/icons-material';

// --- Bảng màu từ Home ---
const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const CheckRequest = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    accountNumber: '1907 1903 0300 17',
    checkQuantity: '25',
    deliveryAddress: '',
    termsAccepted: false,
  });

  const [error, setError] = useState('');

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
    // Xử lý gửi yêu cầu (chưa implement logic thật)
    console.log('Yêu cầu sổ séc:', formData);
    setError('');
  };

  return (
    <>
      {/* Override class bên ngoài */}
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px!important',
        },
        'html, body': {
          overflow: 'auto',
          backgroundColor: '#fff',
        },
      }} />

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
            Yêu cầu sổ séc
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
                Thông tin yêu cầu
              </Typography>
              <Button
                variant="text"
                endIcon={<ChevronRight fontSize="small" />}
                sx={{ textTransform: 'none', color: primaryBlack }}
              >
                Xem lịch sử yêu cầu
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
                  <RequestPage />
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
                select
                label="Số lượng tờ séc"
                name="checkQuantity"
                value={formData.checkQuantity}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: '#fff' }}
              >
                <MenuItem value="25">25 tờ</MenuItem>
                <MenuItem value="50">50 tờ</MenuItem>
                <MenuItem value="100">100 tờ</MenuItem>
              </TextField>

              <TextField
                label="Địa chỉ giao hàng"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                sx={{ bgcolor: '#fff' }}
                placeholder="Nhập địa chỉ nhận sổ séc"
              />

              {/* Thông báo phí phát hành */}
              <Box
                sx={{
                  bgcolor: '#fff',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${mediumGray}`,
                }}
              >
                <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                  Phí phát hành sổ séc
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - 25 tờ: 50,000 VND
                  <br />
                  - 50 tờ: 80,000 VND
                  <br />
                  - 100 tờ: 120,000 VND
                  <br />
                  Phí sẽ được trừ trực tiếp từ tài khoản thanh toán của bạn.
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
                    Tôi đồng ý với các điều khoản và điều kiện phát hành sổ séc.
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
            disabled={!formData.termsAccepted}
            sx={{
              backgroundColor: primaryBlack,
              '&:hover': {
                backgroundColor: '#000',
              },
              borderRadius: 5,
              textTransform: 'none',
            }}
          >
            Gửi yêu cầu
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CheckRequest;