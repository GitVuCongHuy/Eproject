import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Avatar, Button, Stack } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const transactions = [
  {
    date: 'Chủ Nhật, 01 tháng 6, 2025',
    description: 'Tiền chuyển vào',
    detail: 'Interest amount for account in 05/2025',
    amount: '+5',
  },
  {
    date: 'Chủ Nhật, 27 tháng 4, 2025',
    description: 'Tiền chuyển vào',
    detail: 'Interest amount for account in 04/2025',
    amount: '+4',
  },
];

const Dashboard = () => {
  return (
    <Box sx={{ p: 4, backgroundColor: '#f9f9fb', minHeight: '100vh' }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Xin chào, <strong>VU THIEN HUU</strong>
      </Typography>

      {/* Tài khoản & thẻ */}
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">Tài khoản & Thẻ</Typography>
            <Stack direction="row" alignItems="center" mt={1} spacing={1}>
              <CreditCardIcon color="action" />
              <Box>
                <Typography variant="body1">Tài khoản thanh toán</Typography>
                <Typography variant="caption" color="text.secondary">1907 1903 0300 17</Typography>
              </Box>
            </Stack>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">VND</Typography>
            <Typography variant="h6" fontWeight="bold">95,245</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Hoạt động gần đây */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">Hoạt động gần đây</Typography>
            <InfoOutlinedIcon fontSize="small" color="disabled" />
          </Stack>

          {transactions.map((item, index) => (
            <Box key={index} mb={2}>
              <Typography variant="caption" color="text.secondary">{item.date}</Typography>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mt={1}>
                <Stack direction="row" spacing={1}>
                  <AccessTimeIcon color="success" fontSize="small" />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">{item.description}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.detail}</Typography>
                  </Box>
                </Stack>
                <Typography variant="body1" color="success.main" fontWeight="bold">{item.amount}</Typography>
              </Stack>
              {index !== transactions.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}

          <Box textAlign="center" mt={3}>
            <Button variant="contained" sx={{ borderRadius: 20, px: 3, backgroundColor: '#000' }}>
              Xem tất cả giao dịch
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
