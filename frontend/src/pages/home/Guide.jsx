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
  Container,
  Fade,
  Paper,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Receipt,
  RequestPage,
  ChevronRight,
  InfoOutlined,
} from '@mui/icons-material';

// Enhanced color palette
const primaryBlack = '#1a1a1a';
const mediumGray = '#6b7280';
const exceptionGreen = '#10b981';
const lightGray = '#f8fafc';
const accentBlue = '#3b82f6';
const softWhite = '#ffffff';
const borderColor = '#e5e7eb';

const Guide = () => {
  const theme = useTheme();

  const guideSteps = [
    {
      icon: AccountBalanceWallet,
      title: "Kiểm tra số dư tài khoản",
      color: exceptionGreen,
      steps: [
        {
          title: "Truy cập trang chủ",
          description: "Mở ứng dụng Internet Banking và đăng nhập để vào trang chính."
        },
        {
          title: "Xem số dư",
          description: "Tại mục 'Tài khoản & Thẻ', số dư tài khoản thanh toán của bạn sẽ được hiển thị."
        }
      ]
    },
    {
      icon: Receipt,
      title: "Xem sao kê giao dịch",
      color: accentBlue,
      steps: [
        {
          title: "Chọn mục Sao kê",
          description: "Từ menu chính, nhấp vào 'Sao kê' để xem lịch sử giao dịch."
        },
        {
          title: "Xem chi tiết",
          description: "Danh sách giao dịch hiển thị ngày, mô tả, số tiền và loại giao dịch (tiền vào/ra)."
        },
        {
          title: "Tải xuống sao kê",
          description: "Nhấn nút 'Tải xuống' để lưu sao kê dưới dạng tệp."
        }
      ]
    },
    {
      icon: RequestPage,
      title: "Yêu cầu sổ séc",
      color: '#8b5cf6',
      steps: [
        {
          title: "Truy cập mục Yêu cầu sổ séc",
          description: "Từ menu, chọn 'Yêu cầu sổ séc' để mở biểu mẫu."
        },
        {
          title: "Điền thông tin",
          description: "Chọn tài khoản thanh toán, số lượng tờ séc, và nhập địa chỉ giao hàng."
        },
        {
          title: "Xác nhận và gửi",
          description: "Kiểm tra phí phát hành, đồng ý điều khoản, và nhấn 'Gửi yêu cầu'."
        }
      ]
    }
  ];

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px !important',
        },
        'html, body': {
          overflow: 'y',
          backgroundColor: lightGray,
        },
      }} />

      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${lightGray} 0%, #f1f5f9 100%)`,
          py: 4,
        }}
      >
        <Container maxWidth="100vw">
          {/* Header Section */}
          <Fade in timeout={600}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${softWhite} 0%, #fefefe 100%)`,
                border: `1px solid ${borderColor}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${exceptionGreen}, ${accentBlue}, #8b5cf6)`,
                }
              }}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar
                  sx={{
                    bgcolor: exceptionGreen,
                    color: softWhite,
                    width: 48,
                    height: 48,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <InfoOutlined />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={primaryBlack}
                    sx={{
                      background: `linear-gradient(135deg, ${primaryBlack}, ${mediumGray})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Hướng dẫn sử dụng
                  </Typography>
                  <Typography variant="body1" color={mediumGray} mt={0.5}>
                    Internet Banking - Dễ dàng và an toàn
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>

          {/* Guide Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {guideSteps.map((guide, index) => {
              const IconComponent = guide.icon;
              return (
                <Fade in timeout={800 + index * 200} key={index}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: softWhite,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      border: `1px solid ${borderColor}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        // transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      },
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {/* Accent border */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: guide.color,
                      }}
                    />
                    
                    <CardContent sx={{ p: 4 }}>
                      {/* Section Header */}
                      <Box display="flex" alignItems="center" gap={3} mb={3}>
                        <Avatar
                          sx={{
                            bgcolor: guide.color,
                            color: softWhite,
                            width: 56,
                            height: 56,
                            boxShadow: `0 4px 12px ${guide.color}40`,
                          }}
                        >
                          <IconComponent sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Typography
                          variant="h5"
                          fontWeight={600}
                          color={primaryBlack}
                          sx={{ flex: 1 }}
                        >
                          {guide.title}
                        </Typography>
                      </Box>

                      {/* Steps List */}
                      <List sx={{ pl: 0 }}>
                        {guide.steps.map((step, stepIndex) => (
                          <ListItem
                            key={stepIndex}
                            sx={{
                              px: 0,
                              py: 2,
                              borderRadius: 2,
                              mb: 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: `${guide.color}08`,
                                transform: 'translateX(8px)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: `${guide.color}20`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: guide.color,
                                }}
                              >
                                <Typography variant="caption" fontWeight={600}>
                                  {stepIndex + 1}
                                </Typography>
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  color={primaryBlack}
                                  sx={{ mb: 0.5 }}
                                >
                                  {step.title}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  variant="body2"
                                  color={mediumGray}
                                  sx={{ lineHeight: 1.6 }}
                                >
                                  {step.description}
                                </Typography>
                              }
                            />
                            <ChevronRight
                              sx={{
                                color: guide.color,
                                opacity: 0.6,
                                transition: 'all 0.2s ease',
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Fade>
              );
            })}
          </Box>

          {/* Footer Note */}
          <Fade in timeout={1400}>
            <Paper
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${exceptionGreen}10, ${accentBlue}10)`,
                border: `1px solid ${borderColor}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color={mediumGray}>
                💡 <strong>Mẹo:</strong> Luôn đăng xuất sau khi sử dụng để bảo mật tài khoản của bạn
              </Typography>
            </Paper>
          </Fade>
        </Container>
      </Box>
    </>
  );
};

export default Guide;