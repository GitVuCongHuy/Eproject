import React from 'react';
import './Home.css';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import {
  CreditCard,
  TrendingUp,
  Info,
  ChevronRight
} from '@mui/icons-material';

const Home = () => {
  return (
    <Box className="home-container">
      {/* Header */}
      <Box className="home-header">
        <Typography variant="h4">
          Xin chào, VU THIEN HUU
        </Typography>
      </Box>

      {/* Tài khoản & Thẻ Section */}
      <Card className="card-section">
        <CardContent>
          <Box className="section-header">
            <Typography variant="h6">Tài khoản & Thẻ</Typography>
            <button className="view-all-btn">
              Xem tất cả <ChevronRight fontSize="small" />
            </button>
          </Box>

          <Card className="account-card">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar className="account-avatar">
                    <CreditCard />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Tài khoản thanh toán</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', letterSpacing: '1px' }}>
                      1907 1903 0300 17
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption">VND</Typography>
                  <Typography variant="h6" className="amount-text">95,245</Typography>
                  <ChevronRight fontSize="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Hoạt động gần đây */}
      <Card className="card-section">
        <CardContent>
          <Box className="section-header">
            <Typography variant="h6">Hoạt động gần đây</Typography>
            <Info sx={{ color: '#999', cursor: 'pointer' }} />
          </Box>

          <Box display="flex" flexDirection="column" gap={3}>
            {/* Group 1 */}
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                Chủ Nhật, 01 tháng 6, 2025
              </Typography>
              <Card className="activity-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar className="activity-avatar"><TrendingUp /></Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>Tiền chuyển vào</Typography>
                        <Typography variant="caption">Interest amount for account in 05/2025</Typography>
                      </Box>
                    </Box>
                    <Chip label="+5" className="income-chip" />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Group 2 */}
            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>
                Chủ Nhật, 27 tháng 4, 2025
              </Typography>
              <Card className="activity-card">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar className="activity-avatar"><TrendingUp /></Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>Tiền chuyển vào</Typography>
                        <Typography variant="caption">Interest amount for account in 04/2025</Typography>
                      </Box>
                    </Box>
                    <Chip label="+4" className="income-chip" />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Button */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Button className="btn-view-transactions" variant="contained">
          Xem tất cả giao dịch
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
