import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Avatar, TextField,
  MenuItem, FormControlLabel, Checkbox, useTheme, GlobalStyles,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert,
} from '@mui/material';
import { RequestPage, ChevronRight, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/context';

const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

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

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': { marginLeft: '30px !important', marginTop: '30px !important' },
        'html, body': { overflow: 'auto', backgroundColor: '#fff' },
      }} />

      <Box sx={{ ml: '30px', mt: '30px', mr: '30px' }}>
        <Typography variant="h5" fontWeight={700} color={primaryBlack} mb={3}>
          Yêu cầu sổ séc
        </Typography>

        {error && (
          <Alert severity={error.includes('thành công') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600} color={primaryBlack}>Thông tin yêu cầu</Typography>
              <Button onClick={handleShowHistory} disabled={loading} endIcon={<ChevronRight />}>Xem lịch sử</Button>
            </Box>

            <TextField select fullWidth label="Tài khoản thanh toán" name="accountNumber" value={formData.accountNumber} onChange={handleChange} sx={{ mb: 2 }}>
              {cards.map(card => (
                <MenuItem key={card.account_id} value={card.cardNumber}>{card.cardNumber}</MenuItem>
              ))}
            </TextField>

            <TextField select fullWidth label="Số lượng tờ séc" name="checkQuantity" value={formData.checkQuantity} onChange={handleChange} sx={{ mb: 2 }}>
              <MenuItem value="25">25 tờ</MenuItem>
              <MenuItem value="50">50 tờ</MenuItem>
              <MenuItem value="100">100 tờ</MenuItem>
            </TextField>

            <TextField fullWidth label="Địa chỉ giao hàng" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} multiline rows={3} sx={{ mb: 2 }} />

            <FormControlLabel
              control={<Checkbox checked={formData.termsAccepted} name="termsAccepted" onChange={handleChange} />}
              label="Tôi đồng ý với điều khoản và điều kiện."
            />

            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button variant="outlined" onClick={() => navigate(-1)}>Hủy</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={!formData.termsAccepted || loading}>Gửi yêu cầu</Button>
            </Box>
          </CardContent>
        </Card>

        {showHistory && (
          <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>Lịch sử yêu cầu</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ngày</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Chi tiết</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
                    ) : requests.length === 0 ? (
                      <TableRow><TableCell colSpan={4} align="center">Không có yêu cầu.</TableCell></TableRow>
                    ) : (
                      requests.map((r) => (
                        <TableRow key={r.requestId}>
                          <TableCell>{new Date(r.requestDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{getRequestTypeDisplay(r.requestType)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {r.requestDetail ? JSON.stringify(JSON.parse(r.requestDetail), null, 2) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'REJECTED' ? 'Từ chối' : 'Đang xử lý'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
};

export default CheckRequest;