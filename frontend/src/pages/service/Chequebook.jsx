import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField,
  MenuItem, FormControlLabel, Checkbox, useTheme, GlobalStyles,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Chip, Divider, Stack, Container,
  Fade, Slide, IconButton, Tooltip, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Receipt, History, Send, ArrowBack, CheckCircle, AccountBalance,
  LocationOn, Numbers, Policy, Timeline, Refresh, ExpandMore, InfoOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Context'; // Giả định Context này cung cấp các hàm cần thiết

const CheckRequest = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getCards, getUserInfo, requestIssueCheque, getMyRequests } = useAuth();
  
  const [formData, setFormData] = useState({
    accountNumber: '', // Sẽ lưu cardNumber để hiển thị, account_id sẽ được tìm khi submit
    checkQuantity: '25',
    deliveryAddress: '',
    termsAccepted: false,
  });
  
  const [cards, setCards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const getFeeForQuantity = (quantity) => {
    switch (quantity) {
      case '25': return 20000; // Giả định phí cho 25 tờ
      case '50': return 35000; // Giả định phí cho 50 tờ
      case '100': return 60000; // Giả định phí cho 100 tờ
      default: return 0; // Trường hợp không xác định
    }
  };

  // Tính toán phí hiện tại dựa trên lựa chọn của người dùng
  const currentCheckbookFee = getFeeForQuantity(formData.checkQuantity);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const res = await getCards();
        if (res.success && res.data.length > 0) {
          setCards(res.data);
          // Đặt tài khoản mặc định là thẻ đầu tiên
          setFormData(prev => ({ ...prev, accountNumber: res.data[0].cardNumber }));
        } else {
          setErrorMessage('Không tìm thấy thẻ nào. Vui lòng liên hệ ngân hàng.');
        }
      } catch (err) {
        setErrorMessage('Lỗi khi lấy danh sách thẻ. Vui lòng thử lại sau.');
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [getCards]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.termsAccepted) {
      setErrorMessage('Vui lòng chấp nhận điều khoản và điều kiện.');
      return;
    }
    if (!formData.deliveryAddress.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ giao hàng chi tiết.');
      return;
    }
    
    const quantity = parseInt(formData.checkQuantity);
    if (isNaN(quantity) || quantity < 25 || quantity > 100) {
      setErrorMessage('Số lượng tờ séc phải từ 25 đến 100.');
      return;
    }
    
    const selectedCard = cards.find(card => card.cardNumber === formData.accountNumber);
    if (!selectedCard) {
      setErrorMessage('Tài khoản thanh toán không hợp lệ. Vui lòng chọn lại.');
      return;
    }

    try {
      setLoading(true);
      // Giả định API requestIssueCheque cần account_id
      const res = await requestIssueCheque(selectedCard.account_id, quantity);
      
      if (res.success) {
        setSuccessMessage('Yêu cầu sổ séc của bạn đã được gửi thành công! Ngân hàng sẽ xử lý và giao đến địa chỉ của bạn.');
        // Reset form sau khi gửi thành công
        setFormData({ 
          accountNumber: cards.length > 0 ? cards[0].cardNumber : '', 
          checkQuantity: '25', 
          deliveryAddress: '', 
          termsAccepted: false 
        });
        // Tự động tải lại lịch sử yêu cầu nếu đang hiển thị
        if (showHistory) {
          handleShowHistory();
        }
      } else {
        setErrorMessage(res.message || 'Lỗi khi gửi yêu cầu. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi hệ thống khi gửi yêu cầu. Vui lòng thử lại sau.');
      console.error("Error submitting request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const res = await getMyRequests();
      if (res.success) {
        setRequests(res.data);
      } else {
        setErrorMessage(res.message || 'Lỗi khi lấy danh sách yêu cầu. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMessage('Lỗi khi lấy danh sách yêu cầu. Vui lòng thử lại sau.');
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeDisplay = (type) => {
    switch (type) {
      case 'IssueCheque': return 'Yêu cầu sổ séc';
      default: return type;
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'Approved': { label: 'Đã duyệt', color: 'success' },
      'Rejected': { label: 'Từ chối', color: 'error' },
      'Pending': { label: 'Đang xử lý', color: 'warning' }
    };
   
    const config = statusMap[status] || { label: 'Không xác định', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '10px !important',
          marginTop: '10px !important',
        },
        'html, body': {
          overflowY: 'scroll',
          backgroundColor: '#fff',
        },
        '@keyframes float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0px)' }
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }} />
      
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(140, 143, 156) 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(226, 99, 120, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(230, 36, 22, 0.3) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box>
              {/* Hero Header */}
              <Box sx={{ 
                textAlign: 'center',
                mb: 6,
                p: 4,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                borderRadius: 4,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgb(226, 99, 120) 0%, rgb(230, 36, 22) 100%)',
                  mb: 3,
                  animation: 'float 3s ease-in-out infinite',
                  boxShadow: '0 10px 30px rgba(226, 99, 120, 0.4)'
                }}>
                  <Receipt sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  sx={{ 
                    mb: 2,
                    background: 'linear-gradient(135deg, rgb(226, 99, 120) 0%, rgb(230, 36, 22) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  Yêu cầu sổ séc
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ fontWeight: 400, opacity: 0.8 }}
                >
                  Đặt hàng sổ séc mới cho tài khoản của bạn một cách nhanh chóng và tiện lợi
                </Typography>
              </Box>

              {/* Alert Messages */}
              {errorMessage && (
                <Slide direction="down" in={!!errorMessage} timeout={500}>
                  <Alert
                    severity="error"
                    sx={{ 
                      mb: 4, 
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onClose={() => setErrorMessage('')}
                  >
                    {errorMessage}
                  </Alert>
                </Slide>
              )}
              {successMessage && (
                <Slide direction="down" in={!!successMessage} timeout={500}>
                  <Alert
                    severity="success"
                    sx={{ 
                      mb: 4, 
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                    onClose={() => setSuccessMessage('')}
                  >
                    {successMessage}
                  </Alert>
                </Slide>
              )}

              <Stack spacing={4}>
                {/* Main Form */}
                <Fade in timeout={1000}>
                  <Card sx={{ 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    // transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent sx={{ p: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgb(226, 99, 120) 0%, rgb(230, 36, 22) 100%)',
                          boxShadow: '0 4px 16px rgba(226, 99, 120, 0.3)'
                        }}>
                          <Receipt sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="#2c3e50">
                          Thông tin yêu cầu
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Tooltip title="Xem lịch sử yêu cầu">
                          <Button
                            startIcon={<History />}
                            onClick={handleShowHistory}
                            disabled={loading}
                            variant="outlined"
                            sx={{ 
                              textTransform: 'none',
                              borderRadius: 3,
                              px: 3,
                              py: 1.5,
                              borderColor: 'rgba(226, 99, 120, 0.5)',
                              color: 'rgb(226, 99, 120)',
                              '&:hover': {
                                borderColor: 'rgb(226, 99, 120)',
                                background: 'rgba(226, 99, 120, 0.1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(226, 99, 120, 0.25)'
                              },
                              // transition: 'all 0.3s ease'
                            }}
                          >
                            Lịch sử yêu cầu
                          </Button>
                        </Tooltip>
                      </Box>

                      {/* Thông tin về Séc */}
                      <Accordion sx={{ 
                        mb: 4, 
                        borderRadius: 3, 
                        boxShadow: 'none',
                        border: '1px solid rgba(226, 99, 120, 0.2)',
                        background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.05) 0%, rgba(230, 36, 22, 0.05) 100%)'
                      }}>
                        <AccordionSummary
                          expandIcon={<ExpandMore sx={{ color: 'rgb(226, 99, 120)' }} />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                          sx={{ 
                            '& .MuiAccordionSummary-content': { alignItems: 'center' },
                            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(90deg)' }
                          }}
                        >
                          <InfoOutlined sx={{ mr: 1, color: 'rgb(226, 99, 120)' }} />
                          <Typography variant="subtitle1" fontWeight={600} color="#2c3e50">
                            Thông tin quan trọng về Séc
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Séc (hay chi phiếu) là một phương tiện thanh toán không dùng tiền mặt. Séc không có "mệnh giá" cố định như tiền mặt, mà giá trị của mỗi tờ séc sẽ do bạn tự điền vào khi sử dụng. 
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Khi yêu cầu sổ séc, bạn sẽ nhận được một tập các tờ séc trắng. Bạn sẽ điền thông tin và số tiền vào từng tờ séc khi muốn thanh toán cho người khác. 
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Người nhận séc có thể mang séc đến ngân hàng để rút tiền mặt hoặc chuyển khoản vào tài khoản của họ. 
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Có nhiều loại sổ séc, mỗi sổ sẽ có số lượng tờ séc khác nhau. 
                          </Typography>
                        </AccordionDetails>
                      </Accordion>

                      <Stack spacing={4}>
                        <Box sx={{ display: 'grid', gap: 3 }}>
                          <Box sx={{ position: 'relative' }}>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 1, 
                              fontWeight: 600, 
                              color: '#34495e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <AccountBalance sx={{ fontSize: 18, color: 'rgb(226, 99, 120)' }} />
                              Tài khoản thanh toán
                            </Typography>
                            <TextField
                              select
                              fullWidth
                              name="accountNumber"
                              value={formData.accountNumber}
                              onChange={handleChange}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 3,
                                  background: 'rgba(255,255,255,0.8)',
                                  backdropFilter: 'blur(10px)',
                                  // transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'rgba(255,255,255,0.9)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgb(226, 99, 120)',
                                    }
                                  }
                                }
                              }}
                            >
                              {cards.map(card => (
                                <MenuItem key={card.account_id} value={card.cardNumber}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <AccountBalance sx={{ fontSize: 20, color: 'rgb(226, 99, 120)' }} />
                                    {card.cardNumber}
                                  </Box>
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>

                          <Box sx={{ position: 'relative' }}>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 1, 
                              fontWeight: 600, 
                              color: '#34495e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <Numbers sx={{ fontSize: 18, color: 'rgb(226, 99, 120)' }} />
                              Số lượng tờ séc
                            </Typography>
                            <TextField
                              select
                              fullWidth
                              name="checkQuantity"
                              value={formData.checkQuantity}
                              onChange={handleChange}
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 3,
                                  background: 'rgba(255,255,255,0.8)',
                                  backdropFilter: 'blur(10px)',
                                  // transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'rgba(255,255,255,0.9)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgb(226, 99, 120)',
                                    }
                                  }
                                }
                              }}
                            >
                              <MenuItem value="25">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Numbers sx={{ fontSize: 20, color: 'rgb(226, 99, 120)' }} />
                                  25 tờ séc
                                </Box>
                              </MenuItem>
                              <MenuItem value="50">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Numbers sx={{ fontSize: 20, color: 'rgb(226, 99, 120)' }} />
                                  50 tờ séc
                                </Box>
                              </MenuItem>
                              <MenuItem value="100">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Numbers sx={{ fontSize: 20, color: 'rgb(226, 99, 120)' }} />
                                  100 tờ séc
                                </Box>
                              </MenuItem>
                            </TextField>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              * Phí phát hành sổ séc: {currentCheckbookFee.toLocaleString('vi-VN')} VND/quyển.
                            </Typography>
                          </Box>

                          <Box sx={{ position: 'relative' }}>
                            <Typography variant="subtitle2" sx={{ 
                              mb: 1, 
                              fontWeight: 600, 
                              color: '#34495e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <LocationOn sx={{ fontSize: 18, color: 'rgb(226, 99, 120)' }} />
                              Địa chỉ giao hàng
                            </Typography>
                            <TextField
                              fullWidth
                              name="deliveryAddress"
                              value={formData.deliveryAddress}
                              onChange={handleChange}
                              multiline
                              rows={4}
                              placeholder="Nhập địa chỉ chi tiết để nhận sổ séc (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)..."
                              sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 3,
                                  background: 'rgba(255,255,255,0.8)',
                                  backdropFilter: 'blur(10px)',
                                  // transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'rgba(255,255,255,0.9)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgb(226, 99, 120)',
                                    
                                  '&:hover': {
                                    background: 'rgba(255,255,255,0.9)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgb(226, 99, 120)',
                                    }
                                  },
                                  '&.Mui-focused': {
                                    background: 'rgba(255,255,255,1)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgb(226, 99, 120)',
                                      borderWidth: 2
                                    }
                                  }
                                }
                              }}}}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ 
                          my: 3, 
                          background: 'linear-gradient(90deg, transparent, rgba(226, 99, 120, 0.3), transparent)' 
                        }} />

                        <Box sx={{ 
                          p: 3, 
                          borderRadius: 3, 
                          background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.1) 0%, rgba(230, 36, 22, 0.1) 100%)',
                          border: '1px solid rgba(226, 99, 120, 0.2)'
                        }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formData.termsAccepted}
                                name="termsAccepted"
                                onChange={handleChange}
                                sx={{
                                  color: 'rgb(226, 99, 120)',
                                  '&.Mui-checked': {
                                    color: 'rgb(226, 99, 120)',
                                  }
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Policy sx={{ fontSize: 18, color: 'rgb(226, 99, 120)' }} />
                                <Typography variant="body2" fontWeight={500}>
                                  Tôi đồng ý với điều khoản và điều kiện sử dụng dịch vụ
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', pt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(-1)}
                            sx={{ 
                              textTransform: 'none', 
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              borderColor: 'rgba(226, 99, 120, 0.5)',
                              color: 'rgb(226, 99, 120)',
                              '&:hover': {
                                borderColor: 'rgb(226, 99, 120)',
                                background: 'rgba(226, 99, 120, 0.1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(226, 99, 120, 0.25)'
                              },
                              // transition: 'all 0.3s ease'
                            }}
                          >
                            Quay lại
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Send />}
                            onClick={handleSubmit}
                            disabled={!formData.termsAccepted || loading}
                            sx={{ 
                              textTransform: 'none', 
                              borderRadius: 3, 
                              px: 5,
                              py: 1.5,
                              background: 'linear-gradient(135deg, rgb(226, 99, 120) 0%, rgb(230, 36, 22) 100%)',
                              boxShadow: '0 8px 25px rgba(226, 99, 120, 0.4)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, rgb(230, 36, 22) 0%, rgb(226, 99, 120) 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px rgba(226, 99, 120, 0.5)'
                              },
                              '&:disabled': {
                                background: 'rgba(0,0,0,0.12)',
                                color: 'rgba(0,0,0,0.26)'
                              },
                              // transition: 'all 0.3s ease'
                            }}
                          >
                            {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>

                {/* History Table */}
                {showHistory && (
                  <Slide direction="up" in={showHistory} timeout={800}>
                    <Card sx={{ 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        p: 4, 
                        background: 'linear-gradient(135deg, rgb(226, 99, 120) 0%, rgb(230, 36, 22) 100%)',
                        color: 'white'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Timeline sx={{ fontSize: 28 }} />
                          <Typography variant="h5" fontWeight={700}>
                            Lịch sử yêu cầu
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <Tooltip title="Làm mới">
                            <IconButton 
                              onClick={handleShowHistory}
                              sx={{ 
                                color: 'white',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.1)',
                                  transform: 'rotate(180deg)'
                                },
                                // transition: 'all 0.3s ease'
                              }}
                            >
                              <Refresh />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <TableContainer sx={{ maxHeight: 500, overflowX: 'hidden', overflowY: 'auto' }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.1) 0%, rgba(230, 36, 22, 0.1) 100%)',
                                color: '#2c3e50'
                              }}>
                                Ngày yêu cầu
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.1) 0%, rgba(230, 36, 22, 0.1) 100%)',
                                color: '#2c3e50'
                              }}>
                                Loại yêu cầu
                              </TableCell>
                              <TableCell sx={{ 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.1) 0%, rgba(230, 36, 22, 0.1) 100%)',
                                color: '#2c3e50'
                              }}>
                                Chi tiết
                              </TableCell>
                              <TableCell align="center" sx={{ 
                                fontWeight: 700, 
                                fontSize: '0.9rem',
                                background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.1) 0%, rgba(230, 36, 22, 0.1) 100%)',
                                color: '#2c3e50'
                              }}>
                                Trạng thái
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {loading ? (
                              <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress 
                                      size={48} 
                                      sx={{ 
                                        color: 'rgb(226, 99, 120)',
                                        '& .MuiCircularProgress-circle': {
                                          strokeLinecap: 'round'
                                        }
                                      }} 
                                    />
                                    <Typography color="text.secondary" fontStyle="italic">
                                      Đang tải dữ liệu...
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ) : requests.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <History sx={{ fontSize: 48, color: 'rgba(226, 99, 120, 0.5)' }} />
                                    <Typography color="text.secondary" variant="h6">
                                      Chưa có yêu cầu nào
                                    </Typography>
                                    <Typography color="text.secondary" variant="body2">
                                      Các yêu cầu của bạn sẽ hiển thị tại đây
                                    </Typography>
                                    <Button
                                      variant="text"
                                      onClick={() => setShowHistory(false)} // Cho phép ẩn lịch sử
                                      sx={{ 
                                        mt: 1, 
                                        color: 'rgb(226, 99, 120)',
                                        '&:hover': { background: 'rgba(226, 99, 120, 0.1)' }
                                      }}
                                    >
                                      Ẩn lịch sử
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ) : (
                              requests.map((request, index) => (
                                <TableRow
                                  key={request.requestId}
                                  sx={{ 
                                    '&:hover': { 
                                      background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.05) 0%, rgba(230, 36, 22, 0.05) 100%)',
                                      transform: 'scale(1.01)',
                                      boxShadow: '0 4px 20px rgba(226, 99, 120, 0.15)'
                                    },
                                    // transition: 'all 0.3s ease',
                                    borderLeft: index % 2 === 0 ? '4px solid rgba(226, 99, 120, 0.3)' : '4px solid rgba(230, 36, 22, 0.3)'
                                  }}
                                >
                                  <TableCell sx={{ fontWeight: 500 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {new Date(request.requestDate).toLocaleTimeString('vi-VN')}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={getRequestTypeDisplay(request.requestType)}
                                      sx={{
                                        background: 'linear-gradient(135deg, rgba(226, 99, 120, 0.1) 0%, rgba(230, 36, 22, 0.1) 100%)',
                                        color: 'rgb(226, 99, 120)',
                                        fontWeight: 600,
                                        border: '1px solid rgba(226, 99, 120, 0.3)'
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ 
                                      maxWidth: 300, 
                                      overflow: 'hidden',
                                      background: 'rgba(248, 249, 250, 0.8)',
                                      borderRadius: 2,
                                      p: 1.5,
                                      border: '1px solid rgba(0,0,0,0.1)'
                                    }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontFamily: 'monospace',
                                          fontSize: '0.75rem',
                                          wordBreak: 'break-all',
                                          whiteSpace: 'pre-wrap'
                                        }}
                                      >
                                        {request.requestDetail ?
                                          JSON.stringify(JSON.parse(request.requestDetail), null, 2) :
                                          'Không có chi tiết'
                                        }
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    {getStatusChip(request.status)}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Card>
                  </Slide>
                )}
              </Stack>
            </Box>
          </Fade>
        </Container>

        {/* Floating Action Button - Optional */}
        <Box sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 1000
        }}>
          <Tooltip title="Cuộn lên đầu trang">
            <IconButton
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              sx={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, rgb(226, 99, 120) 0%, rgb(230, 36, 22) 100%)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(226, 99, 120, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgb(230, 36, 22) 0%, rgb(226, 99, 120) 100%)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(226, 99, 120, 0.5)'
                },
                // transition: 'all 0.3s ease'
              }}
            >
              <ArrowBack sx={{ transform: 'rotate(90deg)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
};

export default CheckRequest;
