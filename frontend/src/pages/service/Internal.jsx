import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, TextField, Paper, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, Button, Tabs, Tab, InputAdornment, Chip, Card, CardContent, Divider, Grid, GlobalStyles,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress,
  ToggleButton, ToggleButtonGroup, Alert
} from '@mui/material';
import { Search, PersonAdd, AccountBalance, Person, Star, Business } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useAuth } from '../../context/Context';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#ff9800' },
    background: { default: '#f5f7fa' },
    success: { main: '#2e7d32' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h6: { fontWeight: 500 }
  },
  shape: { borderRadius: 12 }
});

const recipients = [
  { id: 1, name: 'shoppe', fullName: 'PHUONG TRUNG HUNG', account: '9344413017', bank: 'Ngân hàng TMCP Ngoại thương Việt Nam', avatar: 'S', color: '#4caf50', favorite: false },
  { id: 2, name: 'shipper', fullName: 'NGUYEN TRONG DAT', account: '10487470841S', bank: 'Ngân hàng TMCP Công thương Việt Nam', avatar: 'S', color: '#2196f3', favorite: false },
  { id: 3, name: 'NGUYEN DUC TRUNG', fullName: 'NGUYEN DUC TRUNG', account: '0603086200888', bank: 'Ngân hàng TMCP Quân Đội', avatar: 'N', color: '#f44336', favorite: true },
  { id: 4, name: 'trung', fullName: 'NGUYEN DUC TRUNG', account: '0862070705', bank: 'Ngân hàng TMCP Quân Đội', avatar: 'T', color: '#ff9800', favorite: true },
  { id: 5, name: 'viettelpost', fullName: 'LAM QUOC ANH', account: '0971660368', bank: 'Ngân hàng TMCP Quân Đội', avatar: 'V', color: '#9c27b0', favorite: true }
];

function TabPanel({ children, value, index }) {
  return (<div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>);
}

function RecipientList({ recipients, onRecipientClick }) {
  return (
    <List sx={{ width: '100%' }}>
      {recipients.map((recipient, index) => (
        <React.Fragment key={recipient.id}>
          <ListItem 
            button
            onClick={() => onRecipientClick(recipient)}
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: recipient.color, width: 48, height: 48, fontSize: '1.2rem', fontWeight: 600 }}>
                {recipient.avatar}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={500}>{recipient.name}</Typography>
                  {recipient.favorite && (<Star sx={{ color: '#ffc107', fontSize: 16 }} />)}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {recipient.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={recipient.account} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.75rem' }} />
                    <Typography variant="caption" color="text.secondary">{recipient.bank}</Typography>
                  </Box>
                </Box>
              }
            />
          </ListItem>
          {index < recipients.length - 1 && <Divider sx={{ mx: 2 }} />}
        </React.Fragment>
      ))}
    </List>
  );
}

export default function MoneyTransferPage() {
  const [myAccountIds, setMyAccountIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { getCustomerAccount, getCards } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [transferType, setTransferType] = useState('internal');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [accountError, setAccountError] = useState('');
  const [checkingAccount, setCheckingAccount] = useState(false);
  
  useEffect(() => {
    const fetchMyAccounts = async () => {
      const result = await getCards();
      if (result.success && result.data) {
        const ids = result.data.map(card => card.cardNumber);
        setMyAccountIds(ids);
      }
    };
    fetchMyAccounts();
  }, [getCards]);

  const handleOpen = () => setOpen(true);
  
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
        setTransferType('internal');
        setNewAccountNumber('');
        setCustomerName('');
        setAccountError('');
        setCheckingAccount(false);
    }, 300);
  };

  const handleTransferTypeChange = (event, newType) => {
    if (newType !== null) {
      setTransferType(newType);
      setNewAccountNumber('');
      setCustomerName('');
      setAccountError('');
    }
  };

  // === HÀM ĐÃ ĐƯỢC SỬA LẠI CHO ĐÚNG ===
  const handleCheckAccount = async () => {
    if (!newAccountNumber) {
      setAccountError('Vui lòng nhập số tài khoản.');
      return;
    }
    if (myAccountIds.includes(newAccountNumber)) {
      setAccountError('Không thể chuyển tiền cho chính tài khoản của bạn.');
      setCustomerName('');
      return;
    }
    
    setCheckingAccount(true);
    setAccountError('');
    setCustomerName('');
    
    // Sử dụng lại hàm getCustomerAccount gốc của bạn
    const result = await getCustomerAccount(newAccountNumber);
    
    if (result.success) {
      setCustomerName(result.data.name_customer);
    } else {
      setAccountError(result.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }

    setCheckingAccount(false);
  };

  const handleContinue = () => {
    if (!customerName || !newAccountNumber) return;
    navigate('/transfer/external', { 
      state: {
        cardNumber: newAccountNumber,
        beneficiaryName: customerName
      }
    });
    handleClose();
  };

  const handleRecipientClick = (recipient) => {
    if (myAccountIds.includes(recipient.account)) {
      alert('Không thể chuyển tiền cho chính tài khoản của bạn.'); 
      return; 
    }
    navigate('/transfer/external', {
      state: {
        cardNumber: recipient.account,
        beneficiaryName: recipient.fullName
      }
    });
  };

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.account.includes(searchTerm)
  );

  const handleTabChange = (event, newValue) => { setTabValue(newValue); };

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': { marginLeft: '10px !important', marginTop: '0px!important' },
        'html, body': { backgroundColor: '#fff', overflow:'hidden'}
      }} />
      <ThemeProvider theme={theme}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
          <Container maxWidth="1000px">
            {/* Các phần giao diện khác giữ nguyên */}
            <Paper elevation={0} sx={{
              p: 3, mb: 3,
              background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
              color: 'white', borderRadius: 3
            }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                Chuyển tiền tới tài khoản khác
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Chuyển tiền nhanh, tức thì 24/7
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField fullWidth placeholder="Tìm người nhận đã lưu" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{startAdornment: (<InputAdornment position="start"><Search color="action" /></InputAdornment>)}} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}/>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="contained" startIcon={<PersonAdd />} fullWidth sx={{ py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 500 }} onClick={handleOpen}>
                    Người nhận mới
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '1rem' }}}>
                  <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Star /> Tất cả người nhận</Box>} />
                  <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Business /> Ngân hàng khác</Box>} />
                </Tabs>
              </Box>
              <Box sx={{ p: 2, height:'500px',overflowY:'scroll'}}>
                <TabPanel value={tabValue} index={0}>
                  {filteredRecipients.length > 0 ? (
                    <RecipientList recipients={filteredRecipients} onRecipientClick={handleRecipientClick} />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">Không tìm thấy người nhận</Typography>
                    </Box>
                  )}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Xin lỗi quý khách, chúng tôi đang cập nhật chức năng này</Typography>
                  </Box>
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                   <RecipientList recipients={filteredRecipients} onRecipientClick={handleRecipientClick} />
                </TabPanel>
              </Box>
            </Paper>
          </Container>
        </Box>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle fontWeight={600}>Thêm người nhận mới</DialogTitle>
          <DialogContent sx={{ minHeight: '230px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ToggleButtonGroup
                color="primary"
                value={transferType}
                exclusive
                onChange={handleTransferTypeChange}
                aria-label="Loại chuyển khoản"
              >
                <ToggleButton value="internal">Ngân hàng TCB</ToggleButton>
                <ToggleButton value="interbank">Ngân hàng khác</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {transferType === 'internal' ? (
              <>
                <DialogContentText sx={{ mb: 2 }}>
                  Vui lòng nhập số thẻ hoặc số tài khoản của người nhận để hệ thống kiểm tra.
                </DialogContentText>
                <TextField 
                  autoFocus 
                  margin="dense" 
                  id="account-number" 
                  label="Số thẻ / Số tài khoản" 
                  type="text" 
                  fullWidth 
                  variant="outlined" 
                  value={newAccountNumber} 
                  onChange={(e) => {
                    setNewAccountNumber(e.target.value); 
                    setCustomerName(''); 
                    setAccountError('');
                  }} 
                  onBlur={handleCheckAccount} 
                  error={!!accountError} 
                  helperText={accountError} 
                  disabled={checkingAccount} 
                  onKeyPress={(e) => e.key === 'Enter' && handleCheckAccount()}
                />
                {customerName && (
                  <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 500, color: 'success.main' }}>
                    Tên người nhận: <strong>{customerName}</strong>
                  </Typography>
                )}
              </>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Tính năng này đang được phát triển. Vui lòng chọn "Nội ngân hàng" để tiếp tục.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleClose} color="inherit">Hủy</Button>
            
            {transferType === 'internal' && (
              <>
                {customerName ? (
                  <Button onClick={handleContinue} variant="contained">
                    Tiếp tục
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCheckAccount} 
                    variant="contained" 
                    disabled={checkingAccount || !newAccountNumber} 
                    startIcon={checkingAccount ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {checkingAccount ? 'Đang kiểm tra...' : 'Kiểm tra'}
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </>
  );
}