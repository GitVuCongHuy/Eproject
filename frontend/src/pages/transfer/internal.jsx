import React, { useState } from 'react';
import {  Box,  Container,  Typography,  TextField,  Paper,  List,  ListItem,  ListItemAvatar,  ListItemText,  Avatar,  Button,  Tabs,  Tab,  InputAdornment,  IconButton,  Chip,  Card,  CardContent,  Divider,  Grid,  GlobalStyles} from '@mui/material';
import {  Search,  PersonAdd,  AccountBalance,  Person,  Star,  Phone,  Email,  Business} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const recipients = [
  {
    id: 1,
    name: 'shoppe',
    fullName: 'PHUONG TRUNG HUNG',
    account: '9344413017',
    bank: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    avatar: 'S',
    color: '#4caf50',
    favorite: false
  },
  {
    id: 2,
    name: 'shipper',
    fullName: 'NGUYEN TRONG DAT',
    account: '10487470841S',
    bank: 'Ngân hàng TMCP Công thương Việt Nam',
    avatar: 'S',
    color: '#2196f3',
    favorite: false
  },
  {
    id: 3,
    name: 'NGUYEN DUC TRUNG',
    fullName: 'NGUYEN DUC TRUNG',
    account: '0603086200888',
    bank: 'Ngân hàng TMCP Quân Đội',
    avatar: 'N',
    color: '#f44336',
    favorite: true
  },
  {
    id: 4,
    name: 'trung',
    fullName: 'NGUYEN DUC TRUNG',
    account: '0862070705',
    bank: 'Ngân hàng TMCP Quân Đội',
    avatar: 'T',
    color: '#ff9800',
    favorite: true
  },
  {
    id: 5,
    name: 'viettelpost',
    fullName: 'LAM QUOC ANH',
    account: '0971660368',
    bank: 'Ngân hàng TMCP Quân Đội',
    avatar: 'V',
    color: '#9c27b0',
    favorite: true
  }
];

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function MoneyTransferPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.account.includes(searchTerm)
  );

  const favoriteRecipients = filteredRecipients.filter(r => r.favorite);
  const allRecipients = filteredRecipients;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const RecipientList = ({ recipients }) => (
    <List sx={{ width: '100%' }}>
      {recipients.map((recipient, index) => (
        <React.Fragment key={recipient.id}>
          <ListItem
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              cursor: 'pointer',
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: recipient.color,
                  width: 48,
                  height: 48,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                }}
              >
                {recipient.avatar}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {recipient.name}
                  </Typography>
                  {recipient.favorite && (
                    <Star sx={{ color: '#ffc107', fontSize: 16 }} />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {recipient.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={recipient.account}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {recipient.bank}
                    </Typography>
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

  return (
    <>
          {/* Override class bên ngoài */}
          <GlobalStyles styles={{
            '._mainContent_b1piq_13': {
              
              marginLeft: '30px !important',
              marginTop: '30px!important',
            },
            'html, body': {
                // overflow: 'hidden',            
                backgroundColor: '#fff',
              },
          }} />
    
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="1000px">
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
              color: 'white',
              borderRadius: 3,
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Chuyển tiền tới tài khoản khác
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Bao gồm chuyển tiền trong Techcombank, Liên Ngân hàng, chuyển nhanh Napas 24/7 và chuyển tiền tới tài khoản chứng khoán
            </Typography>
          </Paper>

          {/* Search and Add New */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Tìm người nhận đã lưu"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Người nhận mới
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs and Recipients */}
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star />
                      Tất cả người nhận
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountBalance />
                      trong Techcombank
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business />
                      Ngân hàng khác
                    </Box>
                  }
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                {allRecipients.length > 0 ? (
                  <RecipientList recipients={allRecipients} />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Không tìm thấy người nhận
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thử tìm kiếm với từ khóa khác
                    </Typography>
                  </Box>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Techcombank Recipients
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Danh sách người nhận trong Techcombank
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <RecipientList recipients={allRecipients} />
              </TabPanel>
            </Box>
          </Paper>

          {/* Stats Card */}
          <Card sx={{ mt: 3, borderRadius: 3 }} elevation={2}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary" fontWeight={600}>
                      {recipients.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng người nhận
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary" fontWeight={600}>
                      {favoriteRecipients.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Yêu thích
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main" fontWeight={600}>
                      24/7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chuyển nhanh
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
    </>
  );
}