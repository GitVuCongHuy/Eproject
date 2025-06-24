import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Container,
  Paper,
  Divider,
  Button
} from '@mui/material';
import {
  CheckCircle,
  ArrowBack,
  Close,
  MoreHoriz,
  KeyboardArrowRight
} from '@mui/icons-material';

export default function BankTransferPage() {
  const floatingCoins = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 30 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative',
      overflow: 'hidden',
      py: 4
    }}>
      {/* Floating Coins Background */}
      {floatingCoins.map((coin) => (
        <Box
          key={coin.id}
          sx={{
            position: 'absolute',
            left: `${coin.left}%`,
            top: `${coin.top}%`,
            width: coin.size,
            height: coin.size,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
            opacity: 0.1,
            animation: `float ${coin.duration}s ease-in-out infinite`,
            animationDelay: `${coin.delay}s`,
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px) rotate(0deg)'
              },
              '50%': {
                transform: 'translateY(-20px) rotate(180deg)'
              }
            }
          }}
        >
          <Typography 
            sx={{ 
              fontSize: coin.size * 0.6, 
              textAlign: 'center', 
              lineHeight: `${coin.size}px`,
              color: '#fff'
            }}
          >
            ₫
          </Typography>
        </Box>
      ))}

      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative',
          zIndex: 1
        }}>
          <IconButton sx={{ mr: 2, color: '#666' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#333', fontWeight: 500 }}>
            Chuyển tiền tới ngân hàng khác
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <IconButton sx={{ color: '#666' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Main Transfer Card */}
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* Success Icon */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: '#4caf50', 
                width: 56, 
                height: 56,
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
              }}>
                <CheckCircle sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>

            {/* Bank Logo and Amount */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2
              }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#e53e3e',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
                    TCB
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: '#ffc107' }}>
                  <MoreHoriz />
                </IconButton>
              </Box>
              
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: '#333',
                mb: 1
              }}>
                Chuyển thành công VND 20,000
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Transfer Details */}
            <Box sx={{ space: 2 }}>
              {/* Recipient Info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Thông tin tài khoản
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                  VU THIEN HUU
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  0375 9623 28
                </Typography>
              </Box>

              {/* Bank Info */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Ngân hàng thụ hưởng
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                  MB Ngân hàng TMCP Quân Đội
                </Typography>
              </Box>

              {/* Transfer Type */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Loại hình
                </Typography>
                <Chip 
                  label="Chuyển tiền" 
                  size="small"
                  sx={{ 
                    bgcolor: '#fff3cd', 
                    color: '#856404',
                    borderRadius: 2
                  }}
                />
              </Box>

              {/* Transaction Time */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Thời gian thực hiện
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                  15:39 13 Tháng 6, 2025
                </Typography>
              </Box>

              {/* Transaction ID */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Mã giao dịch
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontWeight: 500, 
                  color: '#333',
                  fontFamily: 'monospace'
                }}>
                  FT2516408521B801
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 3,
          zIndex: 1,
          position: 'relative'
        }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              borderColor: '#ddd',
              color: '#666',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Thực hiện giao dịch khác
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: 2,
              py: 1.5,
              bgcolor: '#333',
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                bgcolor: '#555'
              }
            }}
          >
            Hoàn thành
          </Button>
        </Box>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </Box>
  );
}