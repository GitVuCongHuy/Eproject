import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, PiggyBank, Facebook, Linkedin, Youtube, Smartphone } from 'lucide-react';
import { Container, Typography, Button, Tabs, Tab, Card, CardContent, Grid, Box, Divider, Stack, IconButton, Paper, GlobalStyles, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/context'; // << 1. SỬA LẠI ĐƯỜNG DẪN NẾU CẦN

export default function TechcombankAccountsPage() {
  const [activeTab, setActiveTab] = useState(0);

  // --- STATE ĐỂ LƯU DỮ LIỆU THẬT TỪ API ---
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- LẤY HÀM API TỪ AUTH CONTEXT ---
  const { getCards } = useAuth(); // << 2. Chỉ cần getCards vì nó đã có đủ thông tin

  // --- SỬ DỤNG useEffect ĐỂ GỌI API KHI COMPONENT MOUNT ---
  useEffect(() => {
    const fetchAccountData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi API để lấy danh sách tất cả các card/tài khoản
        const cardsResponse = await getCards();

        if (cardsResponse.success) {
          // API trả về thành công, cập nhật state với dữ liệu nhận được
          setAccounts(cardsResponse.data);
        } else {
          // API trả về lỗi
          throw new Error(cardsResponse.message || 'Không thể lấy danh sách tài khoản.');
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tài khoản:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  const tabs = [
    'Tài khoản',
    'Thẻ tín dụng',
    'Tiết kiệm & Đầu tư',
    'Vay',
    'Bảo hiểm'
  ];

  // << 3. Tính tổng số dư từ dữ liệu thật trong state
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // --- HÀM RENDER CONTENT ĐỘNG ---
  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" my={10}>
          <CircularProgress />
          <Typography ml={2}>Đang tải dữ liệu tài khoản...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Typography color="error" align="center" my={10}>
          Lỗi: {error}
        </Typography>
      );
    }

    if (accounts.length === 0) {
      return (
        <Typography align="center" my={10}>
          Bạn chưa có tài khoản/thẻ nào.
        </Typography>
      );
    }

    return (
      <>
        {/* Account Cards */}
        <Stack spacing={2} mb={4}>
          {/* << 4. Map qua danh sách tài khoản từ API */}
          {accounts.map((account) => (
            // Sử dụng account_id từ API làm key
            <Card key={account.account_id} variant="outlined">
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
                        {/* Bạn có thể thêm logic để thay đổi icon dựa vào account.type nếu API trả về */}
                        <CreditCard size={20} />
                      </Box>
                      <Box>
                        {/* Dựa theo trang Home, type mặc định là Tài khoản thanh toán */}
                        <Typography fontWeight={500}>Tài khoản thanh toán</Typography>
                        {account.cardNumber && (
                          <Typography variant="body2" color="text.secondary">
                            {account.cardNumber}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item>
                    <Typography fontWeight={600}>
                      {account.balance.toLocaleString('vi-VN')} VND
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
              {totalBalance.toLocaleString('vi-VN')} VND
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  };

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
            {tabs.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>

          {/* << 5. Render nội dung động ở đây */}
          {renderContent()}

          {/* Footer (không thay đổi) */}
          <Paper elevation={0} sx={{ mt: 6, p: 4, bgcolor: 'white' }}>
            <Grid container spacing={4}>
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