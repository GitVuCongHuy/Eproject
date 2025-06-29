// src/pages/CancelChequeRequest.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Avatar,
  TextField, MenuItem, Checkbox, FormControlLabel,
  Snackbar, Alert, CircularProgress, GlobalStyles,
  Divider, Paper, Fade, Zoom
} from '@mui/material';
import { 
  Cancel, 
  CreditCard, 
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/context';

const primaryBlack = '#1a1a1a';
const mediumGray = '#6b7280';
const exceptionGreen = '#10b981';
const lightGray = '#f9fafb';
const accentBlue = 'rgb(192, 226, 99)';
const warningOrange = '#f59e0b';
const errorRed = '#ef4444';

const CancelChequeRequest = () => {
  const theme = useTheme();
  const { getCards, requestCancelCheque } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);
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
    setSubmitting(false);
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        gap={2}
      >
        <CircularProgress size={60} sx={{ color: accentBlue }} />
        <Typography variant="body1" color={mediumGray}>
          Đang tải thông tin...
        </Typography>
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

      <Box 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          backgroundColor: '#ffffff', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        {/* Header với animation */}
        <Fade in timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight={700} mb={1}>
                  Hủy Séc Thanh Toán
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Gửi yêu cầu hủy séc một cách an toàn và nhanh chóng
                </Typography>
              </Box>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 56, 
                  height: 56,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                <Cancel sx={{ fontSize: 28 }} />
              </Avatar>
            </Box>
          </Paper>
        </Fade>

        {/* Main Form Card */}
        <Zoom in timeout={1000}>
          <Card 
            sx={{ 
              mb: 4, 
              borderRadius: 4, 
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb',
              overflow: 'visible'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Section Header */}
              <Box display="flex" alignItems="center" mb={4}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${accentBlue} 0%, ${exceptionGreen} 100%)`,
                    mr: 2
                  }}
                >
                  <CreditCard sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color={primaryBlack}>
                    Thông tin yêu cầu hủy
                  </Typography>
                  <Typography variant="body2" color={mediumGray}>
                    Vui lòng điền đầy đủ thông tin bên dưới
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderColor: '#e5e7eb' }} />

              <Box display="flex" flexDirection="column" gap={4}>
                {/* Account Selection */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={2} color={primaryBlack}>
                    Tài khoản thanh toán
                  </Typography>
                  <TextField
                    select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    sx={{ 
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                          borderWidth: 2,
                        },
                      },
                    }}
                  >
                    {cards.map((card) => (
                      <MenuItem key={card.account_id} value={card.account_id}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <CreditCard sx={{ color: mediumGray, fontSize: 20 }} />
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {card.cardNumber}
                            </Typography>
                            {/* <Typography variant="caption" color={mediumGray}>
                              ID: {card.account_id}
                            </Typography> */}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {/* Cheque ID Input */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={2} color={primaryBlack}>
                    Số séc cần hủy
                  </Typography>
                  <TextField
                    name="chequeId"
                    value={formData.chequeId}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    placeholder="Nhập số séc (VD: 123456)"
                    type="number"
                    sx={{ 
                      bgcolor: '#fff',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Box>

                {/* Terms and Conditions */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    border: `2px solid ${warningOrange}`,
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    <Warning sx={{ color: warningOrange, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={primaryBlack} mb={1}>
                        Điều khoản quan trọng
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        <Typography component="li" variant="body2" color={primaryBlack} mb={1}>
                          Séc sau khi hủy sẽ <strong>không thể sử dụng</strong> trong mọi trường hợp
                        </Typography>
                        <Typography component="li" variant="body2" color={primaryBlack} mb={1}>
                          Yêu cầu <strong>không thể hoàn tác</strong> sau khi xác nhận
                        </Typography>
                        <Typography component="li" variant="body2" color={primaryBlack}>
                          Liên hệ hotline <strong>1900-xxxx</strong> nếu cần hỗ trợ thêm
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Confirmation Checkbox */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    border: formData.termsAccepted 
                      ? `2px solid ${exceptionGreen}` 
                      : `1px solid #e5e7eb`,
                    background: formData.termsAccepted 
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : '#f9fafb',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                        sx={{
                          color: mediumGray,
                          '&.Mui-checked': { 
                            color: exceptionGreen,
                            transform: 'scale(1.1)',
                            transition: 'all 0.2s ease'
                          },
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {formData.termsAccepted && (
                          <CheckCircle sx={{ color: exceptionGreen, fontSize: 20 }} />
                        )}
                        <Typography variant="body1" fontWeight={500} color={primaryBlack}>
                          Tôi đã đọc và đồng ý với tất cả điều khoản hủy séc
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                {/* Error Display */}
                {error && (
                  <Fade in>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        borderRadius: 3,
                        '& .MuiAlert-icon': {
                          fontSize: 24
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}
              </Box>
            </CardContent>
          </Card>
        </Zoom>

        {/* Action Buttons */}
        <Fade in timeout={1200}>
          <Box display="flex" justifyContent="center" gap={3} flexWrap="wrap">
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                borderColor: mediumGray, 
                color: mediumGray,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  borderColor: primaryBlack,
                  color: primaryBlack,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.termsAccepted || !formData.chequeId || submitting}
              size="large"
              sx={{
                background: formData.termsAccepted && formData.chequeId 
                  ? `linear-gradient(135deg, ${accentBlue} 0%, ${exceptionGreen} 100%)`
                  : mediumGray,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  transform: formData.termsAccepted && formData.chequeId 
                    ? 'translateY(-2px)' 
                    : 'none',
                  boxShadow: formData.termsAccepted && formData.chequeId 
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
                    : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                },
                '&:disabled': {
                  background: mediumGray,
                  color: 'white',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {submitting ? (
                <Box display="flex" alignItems="center" gap={2}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  Đang xử lý...
                </Box>
              ) : (
                'Gửi yêu cầu hủy'
              )}
            </Button>
          </Box>
        </Fade>

        {/* Success Snackbar */}
        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={4000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity="success" 
            sx={{ 
              bgcolor: exceptionGreen, 
              color: '#fff',
              borderRadius: 3,
              fontWeight: 600,
              '& .MuiAlert-icon': {
                color: '#fff'
              }
            }}
          >
            ✅ Yêu cầu hủy séc đã được gửi thành công!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default CancelChequeRequest;