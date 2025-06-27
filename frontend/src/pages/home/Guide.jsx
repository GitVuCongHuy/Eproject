import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  useTheme,
  GlobalStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Receipt,
  RequestPage,
  ChevronRight,
} from '@mui/icons-material';

// --- Bảng màu từ các trang trước ---
const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const Guide = () => {
  const theme = useTheme();

  return (
    <>
      {/* Override class bên ngoài */}
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px !important',
        },
        'html, body': {
          overflow: 'y',
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
            Hướng dẫn sử dụng
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>VH</Avatar>
        </Box>

        {/* Guide Content */}
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
            <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>
              Hướng dẫn sử dụng Internet Banking
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Kiểm tra số dư */}
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: exceptionGreen, color: '#fff', width: 32, height: 32 }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Typography variant="body1" fontWeight={600} color={primaryBlack}>
                    Kiểm tra số dư tài khoản
                  </Typography>
                </Box>
                <List sx={{ pl: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Truy cập trang chủ"
                      secondary="Mở ứng dụng Internet Banking và đăng nhập để vào trang chính."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Xem số dư"
                      secondary="Tại mục 'Tài khoản & Thẻ', số dư tài khoản thanh toán của bạn sẽ được hiển thị."
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Xem sao kê */}
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: exceptionGreen, color: '#fff', width: 32, height: 32 }}>
                    <Receipt />
                  </Avatar>
                  <Typography variant="body1" fontWeight={600} color={primaryBlack}>
                    Xem sao kê giao dịch
                  </Typography>
                </Box>
                <List sx={{ pl: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Chọn mục Sao kê"
 Vanitygen       secondary="Từ menu chính, nhấp vào 'Sao kê' để xem lịch sử giao dịch."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Xem chi tiết"
                      secondary="Danh sách giao dịch hiển thị ngày, mô tả, số tiền và loại giao dịch (tiền vào/ra)."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tải xuống sao kê"
                      secondary="Nhấn nút 'Tải xuống' để lưu sao kê dưới dạng tệp."
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Yêu cầu sổ séc */}
              <Box>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: exceptionGreen, color: '#fff', width: 32, height: 32 }}>
                    <RequestPage />
                  </Avatar>
                  <Typography variant="body1" fontWeight={600} color={primaryBlack}>
                    Yêu cầu sổ séc
                  </Typography>
                </Box>
                <List sx={{ pl: 2 }}>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Truy cập mục Yêu cầu sổ séc"
                      secondary="Từ menu, chọn 'Yêu cầu sổ séc' để mở biểu mẫu."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Điền thông tin"
                      secondary="Chọn tài khoản thanh toán, số lượng tờ séc, và nhập địa chỉ giao hàng."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ChevronRight sx={{ color: mediumGray }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Xác nhận và gửi"
                      secondary="Kiểm tra phí phát hành, đồng ý điều khoản, và nhấn 'Gửi yêu cầu'."
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default Guide;