import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  MenuItem, FormControlLabel, Checkbox, useTheme, GlobalStyles,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Chip, Divider, Stack
} from '@mui/material';
import { 
  Receipt, History, Send, ArrowBack, CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Context';

const CheckRequest = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getCards, getUserInfo, requestIssueCheque, getMyRequests } = useAuth();

  const [formData, setFormData] = useState({
    accountNumber: '',
    checkQuantity: '25',
    deliveryAddress: '',
    termsAccepted: false,
  });

  const [cards, setCards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCards();
        if (res.success && res.data.length > 0) {
          setCards(res.data);
          setFormData(prev => ({ ...prev, accountNumber: res.data[0].cardNumber }));
        } else {
          setError('Không tìm thấy thẻ nào.');
        }
      } catch {
        setError('Lỗi khi lấy danh sách thẻ.');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [getCards]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.termsAccepted) return setError('Vui lòng chấp nhận điều khoản.');
    if (!formData.deliveryAddress.trim()) return setError('Vui lòng nhập địa chỉ.');

    const quantity = parseInt(formData.checkQuantity);
    if (isNaN(quantity) || quantity < 25 || quantity > 100) {
      return setError('Số lượng tờ séc phải từ 25 đến 100.');
    }

    const selectedCard = cards.find(card => card.cardNumber === formData.accountNumber);
    if (!selectedCard) return setError('Tài khoản không hợp lệ.');

    try {
      setLoading(true);
      const userInfo = await getUserInfo();
      const customerId = userInfo?.data?.customerId;

      const res = await requestIssueCheque(selectedCard.account_id, quantity);

      if (res.success) {
        setError('Yêu cầu sổ séc đã được gửi thành công!');
        setFormData({ accountNumber: cards[0].cardNumber, checkQuantity: '25', deliveryAddress: '', termsAccepted: false });
      } else {
        setError(res.message || 'Lỗi khi gửi yêu cầu.');
      }
    } catch {
      setError('Lỗi khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    setLoading(true);
    setError('');
    try {
      const res = await getMyRequests();
      if (res.success) {
        setRequests(res.data);
      } else {
        setError('Lỗi khi lấy danh sách yêu cầu.');
      }
    } catch {
      setError('Lỗi khi lấy danh sách yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeDisplay = (type) => {
    switch (type) {
      case 'IssueCheque': return 'Yêu cầu sổ séc';
      default: return type;
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'APPROVED': { label: 'Đã duyệt', color: 'success' },
      'REJECTED': { label: 'Từ chối', color: 'error' },
      'PENDING': { label: 'Đang xử lý', color: 'warning' }
    };
    
    const config = statusMap[status] || statusMap['PENDING'];
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': { marginLeft: '30px !important', marginTop: '30px !important' },
        'html, body': { overflow: 'auto', backgroundColor: '#fafafa' },
      }} />

      <Box sx={{ maxWidth: 1800, mx: 'auto', p: 3, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} color="#1a1a1a" sx={{ mb: 1 }}>
            Yêu cầu sổ séc
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Đặt hàng sổ séc mới cho tài khoản của bạn
          </Typography>
        </Box>

        {/* Alert */}
        {error && (
          <Alert 
            severity={error.includes('thành công') ? 'success' : 'error'} 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Main Form */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Receipt color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Thông tin yêu cầu
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                  startIcon={<History />}
                  onClick={handleShowHistory} 
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  Lịch sử
                </Button>
              </Box>

              <Stack spacing={3}>
                <TextField 
                  select 
                  fullWidth 
                  label="Tài khoản thanh toán" 
                  name="accountNumber" 
                  value={formData.accountNumber} 
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {cards.map(card => (
                    <MenuItem key={card.account_id} value={card.cardNumber}>
                      {card.cardNumber}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField 
                  select 
                  fullWidth 
                  label="Số lượng tờ séc" 
                  name="checkQuantity" 
                  value={formData.checkQuantity} 
                  onChange={handleChange}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="25">25 tờ</MenuItem>
                  <MenuItem value="50">50 tờ</MenuItem>
                  <MenuItem value="100">100 tờ</MenuItem>
                </TextField>

                <TextField 
                  fullWidth 
                  label="Địa chỉ giao hàng" 
                  name="deliveryAddress" 
                  value={formData.deliveryAddress} 
                  onChange={handleChange} 
                  multiline 
                  rows={3}
                  placeholder="Nhập địa chỉ chi tiết..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <Divider />

                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.termsAccepted} 
                      name="termsAccepted" 
                      onChange={handleChange}
                    />
                  }
                  label="Tôi đồng ý với điều khoản và điều kiện"
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                    onClick={handleSubmit} 
                    disabled={!formData.termsAccepted || loading}
                    sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* History Table */}
          {showHistory && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
                  <Typography variant="h6" fontWeight={600}>
                    Lịch sử yêu cầu
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Ngày</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Chi tiết</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <CircularProgress size={32} />
                          </TableCell>
                        </TableRow>
                      ) : requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">
                              Chưa có yêu cầu nào
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.map((request) => (
                          <TableRow 
                            key={request.requestId}
                            sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
                          >
                            <TableCell>
                              {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                            </TableCell>
                            <TableCell>
                              {getRequestTypeDisplay(request.requestType)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {request.requestDetail ? 
                                  JSON.stringify(JSON.parse(request.requestDetail), null, 2) : 
                                  '-'
                                }
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {getStatusChip(request.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default CheckRequest;