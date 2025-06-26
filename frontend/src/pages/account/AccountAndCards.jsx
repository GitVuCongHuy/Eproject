import React, { useState } from 'react';
import {
  Plus,
  CreditCard,
  PiggyBank,
  Facebook,
  Linkedin,
  Youtube,
  Smartphone,
  Weight
} from 'lucide-react';
import {
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Box,
  Divider,
  Stack,
  IconButton,
  Paper,
  GlobalStyles,
} from '@mui/material';

export default function TechcombankAccountsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    'Tài khoản',
    'Thẻ tín dụng',
    'Tiết kiệm & Đầu tư',
    'Vay',
    'Bảo hiểm'
  ];

  const accounts = [
    {
      type: 'Tài khoản thanh toán',
      number: '1605 2005 2888',
      balance: 142
    },
    {
      type: 'Tài khoản thanh toán',
      number: '1907 1704 9420 15',
      balance: 465987
    },
    {
      type: 'Sổ dự sinh lời',
      number: '',
      balance: 0,
      icon: 'savings'
    }
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
     <>
          {/* Override class bên ngoài */}
          <GlobalStyles styles={{
            '._mainContent_b1piq_13': {
              marginLeft: '30px !important',
              marginTop: '30px!important',
            },
            'html, body': {
                overflow: 'y',            
                backgroundColor: '#fff',
        
              },
          }} />
    
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="800px" >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" fontWeight={600}>Tài khoản & Thẻ</Typography>
          <Button variant="contained" color="primary" startIcon={<Plus size={18} />}>
            Mở tài khoản
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, bgcolor: 'white', borderRadius: 2 }}
        >
          {tabs.map((label, index) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>

        {/* Account Cards */}
        <Stack spacing={2} mb={4}>
          {accounts.map((account, i) => (
            <Card key={i} variant="outlined">
              <CardContent>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: '#f0f0f0',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {account.icon === 'savings' ? (
                          <PiggyBank size={20} />
                        ) : (
                          <CreditCard size={20} />
                        )}
                      </Box>
                      <Box>
                        <Typography fontWeight={500}>{account.type}</Typography>
                        {account.number && (
                          <Typography variant="body2" color="text.secondary">
                            {account.number}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Typography fontWeight={600}>
                      VND {account.balance.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Total Balance */}
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography fontWeight={500}>Tổng số dư</Typography>
            <Typography fontWeight={700}>
              VND {totalBalance.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        {/* Footer */}
        <Paper elevation={0} sx={{ mt: 6, p: 4, bgcolor: 'white' }}>
          <Grid container spacing={4}>
            {/* Left: Contact */}
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'red',
                      color: 'white',
                      borderRadius: 1,
                      fontSize: 12,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    TCB
                  </Box>
                  <Typography fontWeight={600}>Liên hệ</Typography>
                </Stack>
                <Typography variant="body2">1800 588 822 / +84 243 944 6699</Typography>
                <Typography variant="body2">call_center@techcombank.com.vn</Typography>
                <Typography variant="body2">
                  Số 6 Phố Quang Trung, P. Trần Hưng Đạo, Q. Hoàn Kiếm, Hà Nội
                </Typography>
                <Typography variant="body2">Mã SWIFT: VTCBVNVX</Typography>

                <Stack direction="row" spacing={1} mt={2}>
                  <IconButton color="primary"><Facebook size={18} /></IconButton>
                  <IconButton color="primary"><Linkedin size={18} /></IconButton>
                  <IconButton color="error"><Youtube size={18} /></IconButton>
                  <IconButton sx={{ bgcolor: '#3182ce', color: 'white' }}>
                    <Typography fontSize={12} fontWeight="bold">Z</Typography>
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>

            {/* Right: App Info */}
            <Grid item xs={12} md={6}>
              <Typography fontWeight={600} gutterBottom>
                Hướng dẫn sử dụng | ATM & Chi nhánh
              </Typography>
              <Stack direction="row" spacing={2} mb={2}>
                <Button variant="contained" startIcon={<Smartphone size={16} />} sx={{ bgcolor: '#000' }}>
                  Google Play
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#000' }}>
                  🍎 App Store
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Tải ứng dụng Techcombank Mobile để trải nghiệm dịch vụ ngân hàng điện tử mọi nơi, mọi lúc.
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Bản Quyền Thuộc Về Ngân Hàng TMCP Kỹ Thương Việt Nam - Techcombank
          </Typography>
        </Paper>
      </Container>
    </Box>

  </>
  );
}
