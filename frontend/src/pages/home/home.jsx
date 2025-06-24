// src/pages/Home/Home.jsx
import React, { useEffect, useState } from 'react'; // << 1. Thêm useEffect, useState
import { useAuth } from '../../context/context'; // << 2. Import useAuth
import {
  Box, Typography, Card, CardContent, Button, Avatar, Chip,
  useTheme, CircularProgress, Alert , GlobalStyles
} from '@mui/material';
import {
  CreditCard, Info, ChevronRight, ArrowUpward, ArrowDownward
} from '@mui/icons-material';

// --- Bảng màu không đổi ---
const primaryBlack = '#333'; 
const mediumGray = '#757575'; 
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

// Hàm helper để định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return amount;
  return amount.toLocaleString('vi-VN');
};

// Hàm helper để lấy chữ cái đầu
const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const Home = () => {
  const theme = useTheme();
  const { getUserInfo, getCards, getTransactions } = useAuth(); // << 3. Lấy các hàm API

  // << 4. Thêm các state để lưu dữ liệu từ API
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // << 5. useEffect để gọi các API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy thông tin người dùng
        const userResult = await getUserInfo();
        if (userResult.success) {
          setUser(userResult.data);
        } else {
          throw new Error(userResult.message || 'Không thể lấy thông tin người dùng.');
        }

        // Lấy danh sách thẻ
        const cardsResult = await getCards();
        if (cardsResult.success) {
          setCards(cardsResult.data);
          
          // Nếu có thẻ, lấy lịch sử giao dịch của thẻ đầu tiên
          if (cardsResult.data && cardsResult.data.length > 0) {
            const firstCardId = cardsResult.data[0].account_id;
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            const transactionsResult = await getTransactions(firstCardId, month, year);
            if (transactionsResult.success) {
              setTransactions(transactionsResult.data);
            }
          }
        } else {
          throw new Error(cardsResult.message || 'Không thể lấy danh sách thẻ.');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getUserInfo, getCards, getTransactions]);

  // << 6. Xử lý trạng thái loading và error
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // << 7. Bắt đầu phần JSX đã được cập nhật
  return (
    <>
      {/* Override class bên ngoài */}
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px!important',
        },
        'html, body': {
            overflow: 'hidden',            
            backgroundColor: '#fff',
          },
      }} />
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={700} color={primaryBlack}>
          Xin chào, {user?.full_name?.toUpperCase()}
        </Typography>
        <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>
          {getInitials(user?.full_name)}
        </Avatar>
      </Box>

      {/* Tài khoản & Thẻ */}
      <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} color={primaryBlack}>Tài khoản & Thẻ</Typography>
            <Button variant="text" endIcon={<ChevronRight fontSize="small" />} sx={{ textTransform: 'none', color: primaryBlack }}>Xem tất cả</Button>
          </Box>
          
          {/* Map qua danh sách thẻ từ API */}
          {cards.length > 0 ? cards.map(card => (
            <Card key={card.account_id} sx={{ borderRadius: 2, boxShadow: theme.shadows[1], backgroundColor: '#fff', mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: mediumGray }}><CreditCard /></Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>Tài khoản thanh toán</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: '1px', opacity: 0.7 }}>{card.cardNumber}</Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>VND</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: primaryBlack }}>{formatCurrency(card.balance)}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )) : (
            <Typography>Không tìm thấy tài khoản nào.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Hoạt động gần đây */}
      <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} color={primaryBlack}>Hoạt động gần đây</Typography>
            <Info sx={{ color: mediumGray, cursor: 'pointer' }} />
          </Box>
          
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Map qua lịch sử giao dịch */}
            {transactions.length > 0 ? transactions.slice(0, 5).map(item => ( // Chỉ hiện 5 giao dịch gần nhất
              <Box key={item.transactionId}>
                <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 500, color: 'text.secondary', mb: 1, display: 'block' }}>
                  {new Date(item.transactionDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[1], backgroundColor: '#fff' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: item.transactionType === 'Deposit' ? exceptionGreen : mediumGray, color: '#fff' }}>
                          {item.transactionType === 'Deposit' ? <ArrowUpward /> : <ArrowDownward />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{item.description}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.status}</Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`${item.transactionType === 'Deposit' ? '+' : '-'}${formatCurrency(item.amount)}`}
                        sx={{ bgcolor: item.transactionType === 'Deposit' ? exceptionGreen : mediumGray, color: '#fff', fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )) : (
              <Typography>Không có hoạt động nào gần đây.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Button */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button variant="contained" sx={{ backgroundColor: primaryBlack, '&:hover': { backgroundColor: '#000' }, borderRadius: 5, py: 1.5, px: 4 }}>
          Xem tất cả giao dịch
        </Button>
      </Box>
    </Box>

    </>
  );
};

export default Home;
