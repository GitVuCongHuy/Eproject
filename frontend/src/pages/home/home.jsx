import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  useTheme,
  GlobalStyles
} from '@mui/material';
import {
  CreditCard,
  Info,
  ChevronRight,
  ArrowUpward,
} from '@mui/icons-material';

// --- Bảng màu mới ---
// Màu đen chính, thay thế cho màu đỏ
const primaryBlack = '#333'; 
// Màu xám cho các chi tiết phụ
const mediumGray = '#757575'; 
// Màu xanh lá cho các trường hợp ngoại lệ
const exceptionGreen = '#2e7d32'; // Một màu xanh lá đậm
// Màu nền sáng
const lightGray = '#fafafa';

const Home = () => {
  const theme = useTheme();

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
            Xin chào, VU THIEN HUU
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>VH</Avatar>
        </Box>

        {/* Tài khoản & Thẻ */}
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
              <Typography variant="h6" fontWeight={600} color={primaryBlack}>Tài khoản & Thẻ</Typography>
              <Button
                variant="text"
                endIcon={<ChevronRight fontSize="small" />}
                sx={{ textTransform: 'none', color: primaryBlack }}
              >
                Xem tất cả
              </Button>
            </Box>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                backgroundColor: '#fff',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: mediumGray }}>
                      <CreditCard />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>Tài khoản thanh toán</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: '1px', opacity: 0.7 }}>
                        1907 1903 0300 17
                      </Typography>
                    </Box>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>VND</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: primaryBlack }}>95,245</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Hoạt động gần đây */}
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
              <Typography variant="h6" fontWeight={600} color={primaryBlack}>Hoạt động gần đây</Typography>
              <Info sx={{ color: mediumGray, cursor: 'pointer' }} />
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              {[
                {
                  date: 'Chủ Nhật, 01 tháng 6, 2025',
                  amount: '+5',
                  note: 'Lãi suất tài khoản tháng 05/2025'
                },
                {
                  date: 'Chủ Nhật, 27 tháng 4, 2025',
                  amount: '+4',
                  note: 'Lãi suất tài khoản tháng 04/2025'
                }
              ].map((item, i) => (
                <Box key={i}>
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: 'text.secondary',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    {item.date}
                  </Typography>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: theme.shadows[1],
                      backgroundColor: '#fff',
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                          {/* --- NGOẠI LỆ: ICON MÀU XANH LÁ --- */}
                          <Avatar sx={{ bgcolor: exceptionGreen, color: '#fff' }}>
                            <ArrowUpward />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>Tiền chuyển vào</Typography>
                            <Typography variant="caption" color="text.secondary">{item.note}</Typography>
                          </Box>
                        </Box>
                         {/* --- NGOẠI LỆ: SỐ TIỀN MÀU XANH LÁ --- */}
                        <Chip
                          label={item.amount}
                          sx={{
                            bgcolor: exceptionGreen,
                            color: '#fff',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Button */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            
            sx={{
              backgroundColor: primaryBlack,
              '&:hover': {
                backgroundColor: '#000', 
              },
              borderRadius: 5,
            }}
          >
            Xem tất cả giao dịch
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Home;
