import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Avatar, Chip,
  useTheme, GlobalStyles, Table, TableCell, TableContainer,
  TableHead, TableRow, TableBody, Paper, CircularProgress,
  Alert, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { ArrowUpward, ArrowDownward, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/context';

const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const Statement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getCards, getTransactions, exportTransactions } = useAuth();

  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCards();
        if (res.success && res.data.length > 0) {
          setCards(res.data);
          setSelectedCard(res.data[0]);
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

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedCard) return;
      setLoading(true);
      setError('');
      try {
        const res = await getTransactions(selectedCard.account_id, month, year);
        if (res.success) {
          const cardNumber = selectedCard.CardNumber?.replace(/\s/g, '') || selectedCard.cardNumber?.replace(/\s/g, '');
          const formatted = res.data.map((t) => {
            const isDebit = t.senderAccount?.replace(/\s/g, '') === cardNumber;
            return {
              date: new Date(t.transactionDate).toLocaleDateString('vi-VN'),
              description: t.description || '-',
              amount: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(t.amount),
              type: isDebit ? 'debit' : 'credit',
            };
          });
          setTransactions(formatted);
        } else {
          setTransactions([]);
        }
      } catch {
        setError('Lỗi khi lấy lịch sử giao dịch.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [selectedCard, month, year, getTransactions]);

  const handleExport = async () => {
    if (!selectedCard) return setError('Vui lòng chọn một thẻ.');
    setExporting(true);
    try {
      const res = await exportTransactions(month, year);
      if (res.success) {
        setError('Sao kê đã được gửi qua email thành công!');
      } else {
        setError(res.message || 'Lỗi khi xuất sao kê.');
      }
    } catch {
      setError('Lỗi khi xuất sao kê.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !transactions.length) {
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
      <Box sx={{ ml: '30px', mt: '30px', mr: '30px' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight={700} color={primaryBlack}>
            Sao kê giao dịch
          </Typography>
        </Box>

        {/* Thông báo */}
        {error && (
          <Alert severity={error.includes('thành công') ? 'success' : 'error'} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Bộ lọc */}
        <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>
              Bộ lọc
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Thẻ</InputLabel>
                <Select
                  value={selectedCard?.account_id || ''}
                  onChange={(e) => setSelectedCard(cards.find(c => c.account_id === e.target.value))}
                  disabled={loading}
                >
                  {cards.map(card => (
                    <MenuItem key={card.account_id} value={card.account_id}>
                      {card.CardNumber || card.cardNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Tháng</InputLabel>
                <Select value={month} onChange={(e) => setMonth(e.target.value)} disabled={loading}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Năm</InputLabel>
                <Select value={year} onChange={(e) => setYear(e.target.value)} disabled={loading}>
                  {years.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Lịch sử giao dịch */}
        <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600} color={primaryBlack}>
                Lịch sử giao dịch
              </Typography>
              <Button
                variant="text"
                endIcon={<ChevronRight />}
                sx={{ color: primaryBlack, fontWeight: 600 }}
                onClick={handleExport}
                disabled={loading || exporting}
              >
                {exporting ? 'Đang xuất...' : 'Tải xuống'}
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography fontWeight={600}>Ngày</Typography></TableCell>
                    <TableCell><Typography fontWeight={600}>Mô tả</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>Số tiền</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight={600}>Loại</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography>Không có giao dịch.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((t, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Typography>{t.date}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: t.type === 'credit' ? exceptionGreen : mediumGray,
                                width: 32,
                                height: 32,
                              }}
                            >
                              {t.type === 'credit' ? <ArrowUpward /> : <ArrowDownward />}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>{t.description}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={t.amount}
                            sx={{
                              bgcolor: t.type === 'credit' ? exceptionGreen : mediumGray,
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{t.type === 'credit' ? 'Tiền vào' : 'Tiền ra'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Nút quay lại */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: primaryBlack,
              borderRadius: 5,
              py: 1.5,
              px: 4,
              '&:hover': { backgroundColor: '#000' },
            }}
          >
            Quay lại
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Statement;