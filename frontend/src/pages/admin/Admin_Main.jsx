import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Container,
  IconButton,
  Fade,
  Skeleton,
  useTheme,
  alpha,
  Avatar,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  AccountBalance,
  CreditCard,
  TrendingUp,
  People,
  Lock,
  LockOpen,
  Assessment,
  CalendarToday,
  Refresh,
  TrendingDown,
  AttachMoney,
  AccountBalanceWallet,
  Security,
  Analytics,
  BarChart,
  Timeline,
  PersonAdd,
  CreditScore,
  MonetizationOn,
  SwapHoriz
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';

const BASE_URL = 'http://localhost:5028';

// Enhanced StatCard với animation và gradient
const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend, loading = false }) => {
  const theme = useTheme();
  
  const gradients = {
    primary: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    success: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
    warning: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
    error: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
    info: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.light} 100%)`,
    secondary: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`
  };

  return (
    <Fade in timeout={500}>
      <Card 
        sx={{ 
          height: '100%',
          background: gradients[color],
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[10],
          },
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer'
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: alpha('#fff', 0.2), 
                width: 56, 
                height: 56,
                backdropFilter: 'blur(10px)'
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip 
                icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                sx={{ 
                  bgcolor: alpha('#fff', 0.2),
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
              />
            )}
          </Box>
          
          <Box>
            {loading ? (
              <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: alpha('#fff', 0.2) }} />
            ) : (
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {value}
              </Typography>
            )}
            
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
              {title}
            </Typography>
            
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </CardContent>
        
        {/* Decorative background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            opacity: 0.1,
            transform: 'rotate(45deg) translate(20px, -20px)',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 20px)'
          }}
        />
      </Card>
    </Fade>
  );
};

// Enhanced Error Alert
const ErrorAlert = ({ error, onClose }) => (
  <Snackbar 
    open={!!error} 
    autoHideDuration={6000} 
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <Alert 
      onClose={onClose} 
      severity="error" 
      sx={{ 
        width: '100%',
        backdropFilter: 'blur(10px)',
        bgcolor: alpha('#f44336', 0.9)
      }}
    >
      {error}
    </Alert>
  </Snackbar>
);

// Enhanced Loading Card
const LoadingCard = ({ height = 200 }) => (
  <Card sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box textAlign="center">
      <CircularProgress size={40} thickness={4} />
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Đang tải dữ liệu...
      </Typography>
    </Box>
  </Card>
);

// Enhanced Bank Stats Component
const BankStats = () => {
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/backend/bank`);
      setBankData(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin ngân hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard height={300} />;

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 60, height: 60 }}>
              <AccountBalance fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Banking system
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Bank information overview
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={fetchBankData}
            sx={{ color: 'white', bgcolor: alpha('#fff', 0.1) }}
          >
            <Refresh />
          </IconButton>
        </Box>

        {bankData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {bankData.bank_name}
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  📍 {bankData.address}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  🏢 {bankData.bankType}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  📞 {bankData.contactNumber}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  bgcolor: alpha('#fff', 0.2),
                  p: 3,
                  borderRadius: 2,
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <MonetizationOn fontSize="large" sx={{ mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bankData.totalBalance)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total system balance
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="warning" sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}>
            Không có dữ liệu ngân hàng
          </Alert>
        )}
      </CardContent>
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: alpha('#fff', 0.1),
          zIndex: 1
        }}
      />
    </Card>
  );
};

// Enhanced Customer Stats
const CustomerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/backend/customer/stats`);
      setStats(response.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải thống kê tài khoản: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current, total) => {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  if (loading) return <LoadingCard height={200} />;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StatCard
          title="Total customers"
          value={stats?.totalAccounts || 0}
          icon={<People fontSize="large" />}
          color="primary"
          subtitle="All accounts in the system"
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard
          title="Active"
          value={stats?.unlockedAccounts || 0}
          icon={<LockOpen fontSize="large" />}
          color="success"
          subtitle={`${calculateTrend(stats?.unlockedAccounts, stats?.totalAccounts)}% tổng số`}
          trend={5.2}
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard
          title="Temporarily locked"
          value={stats?.lockedAccounts || 0}
          icon={<Security fontSize="large" />}
          color="error"
          subtitle={`${calculateTrend(stats?.lockedAccounts, stats?.totalAccounts)}% tổng số`}
          trend={-2.1}
          loading={loading}
        />
      </Grid>
    </Grid>
  );
};

// Enhanced Card Stats with better visualization
const CardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCardStats();
  }, []);

  const fetchCardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/backend/accounts_manager/admin-statistics`);
      setStats(response.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải thống kê thẻ: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard height={400} />;

  return (
    <Grid container spacing={3}   sx={{ justifyContent:'center'}}>
      {/* Stats Cards */}
      <Grid item xs={12} >
        <Grid container spacing={2}  > 
          <Grid item xs={12} md={3} >
            <StatCard
              title="Total number of cards"
              value={stats?.totalAccounts || 0}
              icon={<CreditCard fontSize="large" />}
              color="primary"
              subtitle="All card types"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Debit card"
              value={stats?.normalCardCount || 0}
              icon={<AccountBalanceWallet fontSize="large" />}
              color="success"
              subtitle={`${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalNormalBalance || 0)}`}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Credit card"
              value={stats?.creditCardCount || 0}
              icon={<CreditScore fontSize="large" />}
              color="warning"
              subtitle={`${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalCreditDebt || 0)}`}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Card is locked"
              value={stats?.lockedAccounts || 0}
              icon={<Lock fontSize="large" />}
              color="error"
              subtitle="Need to consider"
              loading={loading}
            />
          </Grid>
        </Grid>
      </Grid>
      
      {/* Top Balances */}
      {stats?.top10Balances && stats.top10Balances.length > 0 && (
        <Grid item xs={12}>
          <Card sx={{ overflow: 'hidden' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BarChart />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top 10 VIP accounts
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Customer with highest balance
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <List sx={{ p: 0 }}>
                {stats.top10Balances.map((account, index) => (
                  <ListItem 
                    key={account.account_id} 
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: index < 3 ? alpha('#ffd700', 0.1) : 'background.paper',
                      '&:hover': {
                        bgcolor: alpha('#1976d2', 0.05),
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: index < 3 ? 'warning.main' : 'primary.main',
                        mr: 2,
                        fontWeight: 'bold'
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {account.full_name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            **** **** **** {account.cardNumber?.slice(-4)}
                          </Typography>
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(account.balance)}
                          </Typography>
                        </Box>
                      }
                    />
                    {index < 3 && (
                      <Chip 
                        label={index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} 
                        sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Enhanced Transaction Stats
const TransactionStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactionStats();
  }, []);

  const fetchTransactionStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/backend/transaction_Controler/Admin_Transaction_Statistics`);
      setStats(response.data.data);
      setError('');
    } catch (err) {
      setError('Không thể tải thống kê giao dịch: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard height={400} />;

  return (
    <Grid container spacing={3}>
      {/* Overview Stats */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total transaction"
              value={stats?.totalTransactions || 0}
              icon={<SwapHoriz fontSize="large" />}
              color="primary"
              subtitle={`${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalAmount || 0)}`}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Trade today"
              value={stats?.transactionsToday || 0}
              icon={<CalendarToday fontSize="large" />}
              color="success"
              subtitle="Update realtime"
              trend={8.5}
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Success rate"
              value={`${stats?.totalTransactions > 0 ? Math.round(((stats?.totalTransactions - (stats?.failedTransactions || 0)) / stats?.totalTransactions) * 100) : 0}%`}
              icon={<Assessment fontSize="large" />}
              color="info"
              subtitle="System performance"
              trend={2.3}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Top Users */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  Top senders
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Most Trading Customers
                </Typography>
              </Box>
            </Box>
            
            {stats?.topSenders && stats.topSenders.length > 0 ? (
              <List sx={{ p: 0 }}>
                {stats.topSenders.map((sender, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      bgcolor: index % 2 === 0 ? alpha('#2e7d32', 0.05) : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2, fontSize: '0.875rem' }}>
                      #{index + 1}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {sender.sender}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sender.totalSent)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">Chưa có dữ liệu</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <TrendingDown />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="secondary.main">
                  Top recipients
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  The customer who gets the most money
                </Typography>
              </Box>
            </Box>
            
            {stats?.topReceivers && stats.topReceivers.length > 0 ? (
              <List sx={{ p: 0 }}>
                {stats.topReceivers.map((receiver, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      bgcolor: index % 2 === 0 ? alpha('#9c27b0', 0.05) : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, fontSize: '0.875rem' }}>
                      #{index + 1}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {receiver.receiver}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(receiver.totalReceived)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary">Chưa có dữ liệu</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Enhanced Transaction Chart
const TransactionChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('2025-07-01');
  const [endDate, setEndDate] = useState('2025-07-04');

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/backend/Transaction_Controler/Admin_Transaction_Statistics_ByRange?startDate=${startDate}&endDate=${endDate}`
      );
      setChartData(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Không thể tải dữ liệu biểu đồ: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <Card sx={{ overflow: 'hidden'  }}>
      <CardContent >
        <Box display="flex" alignItems="center" justifyContent="between" mb={3} >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Timeline />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Trading chart over time
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Trading Trend Analysis
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Paper sx={{ p: 2, mb: 3, bgcolor: alpha('#1976d2', 0.05) }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="End date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                onClick={fetchChartData}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <Analytics />}
                fullWidth
                sx={{ height: 40 }}
              >
                {loading ? 'Loading...' : 'Analysis'}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setStartDate('2025-07-01');
                  setEndDate('2025-07-04');
                }}
                fullWidth
                sx={{ height: 40 }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {loading && <LinearProgress  sx={{ mb: 2 }} />}

        {chartData.length > 0 ? (
          <Box height={500}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#666' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  stroke="#666"
                />
                <YAxis tick={{ fontSize: 12, fill: '#666' }} stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value, name) => [
                    value, 
                    name === 'totalTransactions' ? 'Total transaction' : 
                    name === 'successTransactions' ? 'Success' : 'Failure'
                  ]}
                  labelFormatter={(date) => `📅 ${date}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => 
                    value === 'totalTransactions' ? '📊 Total transaction' : 
                    value === 'successTransactions' ? '✅ Success' : '❌ Failure'
                  }
                />
                <Area 
                  type="monotone" 
                  dataKey="totalTransactions" 
                  stroke="#1976d2" 
                  strokeWidth={3}
                  fill="url(#totalGradient)"
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 6 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="successTransactions" 
                  stroke="#2e7d32" 
                  strokeWidth={2}
                  fill="url(#successGradient)"
                  dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="failedTransactions" 
                  stroke="#d32f2f" 
                  strokeWidth={2}
                  fill="url(#failedGradient)"
                  dot={{ fill: '#d32f2f', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box height={400}  display="flex" alignItems="center" justifyContent="center">
            {loading ? (
              <Box textAlign="center">
                <CircularProgress size={60} thickness={4} />
                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  Analyzing data...
                </Typography>
              </Box>
            ) : (
              <Box textAlign="center">
                <Assessment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  No data to display
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Please select another time period
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const Admin_Main = () => {
  const [globalError, setGlobalError] = useState('');
  const theme = useTheme();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      pb: 4
    }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Header */}
        {/* <Box mb={4}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            🏦 Banking Admin Dashboard
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Hệ thống quản trị ngân hàng - Phiên bản chuyên nghiệp
          </Typography>
          <Divider sx={{ mt: 2, bgcolor: alpha(theme.palette.primary.main, 0.2) }} />
        </Box> */}

        <Grid container spacing={4}>
          {/* Bank Information */}
          <Grid >
            <Fade in timeout={500}>
              <div>
                <BankStats />
              </div>
            </Fade>
          </Grid>

          {/* Customer Statistics */}
          <Grid item xs={12} >
            <Fade in timeout={700}>
              <Paper 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <People fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      Customer statistics
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Overview of customer accounts in the system
                    </Typography>
                  </Box>
                </Box>
                <CustomerStats />
              </Paper>
            </Fade>
          </Grid>

          {/* Card Statistics */}
          <Grid item xs={12} sx={{ width: '100% ' }} >
            <Fade in timeout={900}   >
              <Paper 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.1) ,
                  
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <CreditCard fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      Bank card management
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Detailed statistics of VIP cards and accounts
                    </Typography>
                  </Box>
                </Box>
                <CardStats />
              </Paper>
            </Fade>
          </Grid>

          {/* Transaction Statistics */}
          <Grid item xs={12} sx={{ width: '100% ' }}>
            <Fade in timeout={1100}>
              <Paper 
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.success.main, 0.1)
                }}
              >
                <Box display="flex" alignItems="center" gap={2} mb={4}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <TrendingUp fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      Transaction analysis
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Overview of trading activities and top customers
                    </Typography>
                  </Box>
                </Box>
                <TransactionStats />
              </Paper>
            </Fade>
          </Grid>

          {/* Transaction Chart */}
          <Grid item xs={12} sx={{ width: '100% ' }}>
            <Fade in timeout={1300}>
              <div>
                <TransactionChart />
              </div>
            </Fade>
          </Grid>


        </Grid>

        <ErrorAlert error={globalError} onClose={() => setGlobalError('')} />
      </Container>
    </Box>
  );
};

export default Admin_Main;