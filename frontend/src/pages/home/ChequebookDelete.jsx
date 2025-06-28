// src/pages/CancelChequeRequest.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Avatar,
  TextField, MenuItem, Checkbox, FormControlLabel,
  Snackbar, Alert, CircularProgress, GlobalStyles
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/context';

const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const CancelChequeRequest = () => {
  const theme = useTheme();
  const { getCards, requestCancelCheque } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    accountId: '',
    chequeId: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      const result = await getCards();
      if (result.success) {
        setCards(result.data);
        if (result.data.length > 0) {
          setFormData((prev) => ({ ...prev, accountId: result.data[0].account_id }));
        }
      }
      setLoading(false);
    };
    fetchCards();
  }, [getCards]);

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

 const handleSubmit = async () => {
  if (!formData.termsAccepted) {
    setError('Vui lòng đồng ý với điều khoản trước khi gửi yêu cầu.');
    return;
  }
  if (!formData.chequeId.trim()) {
    setError('Vui lòng nhập số séc cần hủy.');
    return;
  }

  console.log("Đang gửi yêu cầu hủy với chequeId:", formData.chequeId);
const response = await requestCancelCheque(Number(formData.chequeId));
  console.log("Kết quả từ requestCancelCheque:", response);

  if (response.success) {
    setOpenSnackbar(true);
    setFormData({
      accountId: cards.length > 0 ? cards[0].account_id : '',
      chequeId: '',
      termsAccepted: false,
    });
  } else {
    setError(response.message || 'Có lỗi xảy ra.');
  }
};

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px !important',
        },
        'html, body': {
          overflow: 'auto',
          backgroundColor: '#fff',
        },
      }} />

      <Box sx={{ p: 3, backgroundColor: '#ffffff', minHeight: '100vh' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" fontWeight={700} color={primaryBlack}>
            Gửi yêu cầu hủy séc
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>VH</Avatar>
        </Box>

        {/* Card */}
        <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Thông tin yêu cầu hủy
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
              <TextField
                select
                name="accountId"
                label="Chọn tài khoản thanh toán"
                value={formData.accountId}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: '#fff' }}
              >
                {cards.map((card) => (
                  <MenuItem key={card.account_id} value={card.account_id}>
                    {card.cardNumber} ({card.account_id})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Số séc cần hủy"
                name="chequeId"
                value={formData.chequeId}
                onChange={handleChange}
                fullWidth
                sx={{ bgcolor: '#fff' }}
                placeholder="Nhập số séc cần hủy (VD: CHK123456)"
                type="number"
              />

              {/* Ghi chú điều khoản */}
              <Box bgcolor="#fff" p={2} borderRadius={1} border={`1px solid ${mediumGray}`}>
                <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                  Điều khoản khi gửi yêu cầu hủy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - Séc sau khi hủy sẽ không thể sử dụng.<br />
                  - Yêu cầu không thể hoàn tác sau khi xác nhận.<br />
                  - Liên hệ ngân hàng nếu cần hỗ trợ thêm.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    sx={{
                      color: primaryBlack,
                      '&.Mui-checked': { color: exceptionGreen },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color={primaryBlack}>
                    Tôi đồng ý với điều khoản hủy séc.
                  </Typography>
                }
              />

              {error && <Typography color="error">{error}</Typography>}
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        <Box display="flex" justifyContent="center" gap={2}>
          <Button variant="outlined" sx={{ borderColor: primaryBlack, color: primaryBlack, borderRadius: 5 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.termsAccepted || !formData.chequeId}
            sx={{
              backgroundColor: primaryBlack,
              '&:hover': { backgroundColor: '#000' },
              borderRadius: 5,
            }}
          >
            Gửi yêu cầu hủy
          </Button>
        </Box>

        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ bgcolor: exceptionGreen, color: '#fff' }}>
            Yêu cầu hủy séc đã được gửi thành công!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default CancelChequeRequest;
