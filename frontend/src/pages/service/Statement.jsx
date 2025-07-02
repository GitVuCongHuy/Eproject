import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Avatar, Chip,
  useTheme, GlobalStyles, Table, TableCell, TableContainer,
  TableHead, TableRow, TableBody, Paper, CircularProgress,
  Alert, Select, MenuItem, FormControl, InputLabel, Fade,
  Zoom, Grid, IconButton, Tooltip, Divider
} from '@mui/material';
import {
  ArrowUpward, 
  ArrowDownward, 
  Download,
  AccountBalance,
  CalendarMonth,
  TrendingUp,
  TrendingDown,
  Receipt,
  FilterList,
  Timeline,
  Refresh,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Context';

const primaryBlack = '#1a1a1a';
const mediumGray = '#6b7280';
const exceptionGreen = '#10b981';
const lightGray = '#f9fafb';
const accentBlue = '#3b82f6';
const errorRed = '#ef4444';
const warningOrange = '#f59e0b';

const Statement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getCards, getTransactions, exportTransactions } = useAuth();

  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.rawAmount, 0); 
  
  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.rawAmount, 0);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCards();
        if (res.success && res.data.length > 0) {
          setCards(res.data);
          setSelectedCard(res.data[0]);
        } else {
          setError('No cards found.');
        }
      } catch {
        setError('Error fetching card list.');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [getCards]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedCard) return;
      setLoading(true);
      setError('');
      try {
        const res = await getTransactions(selectedCard.account_id, month, year);
        if (res.success) {
          const cardNumber = selectedCard.CardNumber?.replace(/\s/g, '') || selectedCard.cardNumber?.replace(/\s/g, '');
          const formatted = res.data.map((t) => {
            const isDebit = t.senderAccount?.replace(/\s/g, '') === cardNumber;
            return {
              date: new Date(t.transactionDate).toLocaleDateString('en-GB'),
              description: t.description || '-',
              amount: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(t.amount),
              type: isDebit ? 'debit' : 'credit',
              rawAmount: t.amount,
            };
          });
          setTransactions(formatted);
        } else {
          setTransactions([]);
        }
      } catch {
        setError('Error fetching transaction history.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [selectedCard, month, year, getTransactions]);

  const handleExport = async () => {
    if (!selectedCard) return setError('Please select a card.');
    setExporting(true);
    try {
      const res = await exportTransactions(month, year);
      if (res.success) {
        setError('Statement has been sent to your email successfully!');
      } else {
        setError(res.message || 'Error exporting statement.');
      }
    } catch {
      setError('Error exporting statement.');
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    if (selectedCard) {
      const fetchTransactions = async () => {
        setLoading(true);
        try {
          const res = await getTransactions(selectedCard.account_id, month, year);
          if (res.success) {
            const cardNumber = selectedCard.CardNumber?.replace(/\s/g, '') || selectedCard.cardNumber?.replace(/\s/g, '');
            const formatted = res.data.map((t) => {
              const isDebit = t.senderAccount?.replace(/\s/g, '') === cardNumber;
              return {
                date: new Date(t.transactionDate).toLocaleDateString('en-GB'),
                description: t.description || '-',
                amount: new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(t.amount),
                type: isDebit ? 'debit' : 'credit',
                rawAmount: t.amount,
              };
            });
            setTransactions(formatted);
          }
        } catch {
          setError('Error refreshing data.');
        } finally {
          setLoading(false);
        }
      };
      fetchTransactions();
    }
  };

  if (loading && !transactions.length && !cards.length) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        gap={2}
      >
        <CircularProgress size={60} sx={{ color: accentBlue }} />
        <Typography variant="body1" color={mediumGray}>
          Loading transaction statement...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px !important',
        },
        'html, body': {
          overflowY: 'scroll',
          backgroundColor: '#fff',
        },
      }} />
      
      <Box 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          backgroundColor: '#ffffff', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Fade in timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 3,
              background: 'linear-gradient(135deg,rgb(226, 99, 120) 0%,rgb(230, 36, 22) 100%)',
              color: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" fontWeight={700} mb={1}>
                  Transaction Statement
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  View detailed transaction history and export reports
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Refresh data">
                  <IconButton 
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    width: 48, 
                    height: 48,
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Receipt sx={{ fontSize: 24 }} />
                </Avatar>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {error && (
          <Fade in>
            <Alert 
              severity={error.toLowerCase().includes('success') ? 'success' : 'error'} 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                '& .MuiAlert-icon': { fontSize: 24 }
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <Zoom in timeout={1000}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Credit
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {formatCurrency(totalCredit)}
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Debit
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {formatCurrency(totalDebit)}
                      </Typography>
                    </Box>
                    <TrendingDown sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Transactions
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {transactions.length}
                      </Typography>
                    </Box>
                    <Timeline sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Zoom>

        <Zoom in timeout={1200}>
          <Card sx={{ 
            mb: 4, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${accentBlue} 0%, ${exceptionGreen} 100%)`,
                    mr: 2
                  }}
                >
                  <FilterList sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color={primaryBlack}>
                    Search Filters
                  </Typography>
                  <Typography variant="body2" color={mediumGray}>
                    Select card, month, and year to view transactions
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <InputLabel>Payment Card</InputLabel>
                  <FormControl fullWidth>
                    <Select
                      value={selectedCard?.account_id || ''}
                      onChange={(e) => setSelectedCard(cards.find(c => c.account_id === e.target.value))}
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                        },
                      }}
                    >
                      {cards.map(card => (
                        <MenuItem key={card.account_id} value={card.account_id}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <AccountBalance sx={{ color: mediumGray, fontSize: 20 }} />
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {card.CardNumber || card.cardNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <InputLabel>Month</InputLabel>
                  <FormControl fullWidth>
                    <Select 
                      value={month} 
                      onChange={(e) => setMonth(e.target.value)} 
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                        },
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <MenuItem key={m} value={m}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarMonth sx={{ color: mediumGray, fontSize: 20 }} />
                            Month {m}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                  <InputLabel>Year</InputLabel>
                  <FormControl fullWidth>
                    <Select 
                      value={year} 
                      onChange={(e) => setYear(e.target.value)} 
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentBlue,
                        },
                      }}
                    >
                      {years.map(y => (
                        <MenuItem key={y} value={y}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarMonth sx={{ color: mediumGray, fontSize: 20 }} />
                            {y}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Zoom>

        <Zoom in timeout={1400}>
          <Card sx={{ 
            mb: 4, 
            borderRadius: 3, 
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color={primaryBlack}>
                      Transaction History
                    </Typography>
                    <Typography variant="body2" color={mediumGray}>
                      {transactions.length} transactions in {month}/{year}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleExport}
                    disabled={loading || exporting || transactions.length === 0}
                    sx={{
                      background: `linear-gradient(135deg, ${accentBlue} 0%, ${exceptionGreen} 100%)`,
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {exporting ? 'Exporting...' : 'Download'}
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ maxHeight: 600, overflowX: 'hidden', overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: lightGray, fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>
                        Transaction Date
                      </TableCell>
                      <TableCell sx={{ backgroundColor: lightGray, fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>
                        Description
                      </TableCell>
                      <TableCell align="right" sx={{ backgroundColor: lightGray, fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>
                        Amount
                      </TableCell>
                      <TableCell align="center" sx={{ backgroundColor: lightGray, fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>
                        Transaction Type
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <CircularProgress size={40} sx={{ color: accentBlue }} />
                            <Typography color={mediumGray}>Loading data...</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <Receipt sx={{ fontSize: 60, color: mediumGray, opacity: 0.5 }} />
                            <Typography variant="h6" color={mediumGray}>
                              No Transactions
                            </Typography>
                            <Typography variant="body2" color={mediumGray}>
                              No transactions found for this period
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((t, idx) => (
                        <TableRow 
                          key={idx}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: lightGray,
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: '#fbfcfd'
                            }
                          }}
                        >
                          <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                            <Typography variant="body2" fontWeight={500}>
                              {t.date}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #f1f5f9' }}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  bgcolor: t.type === 'credit' ? exceptionGreen : errorRed,
                                  width: 36,
                                  height: 36,
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                {t.type === 'credit' ? 
                                  <ArrowUpward sx={{ fontSize: 20 }} /> : 
                                  <ArrowDownward sx={{ fontSize: 20 }} />
                                }
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {t.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                            <Chip
                              label={t.amount}
                              sx={{
                                bgcolor: t.type === 'credit' ? exceptionGreen : errorRed,
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                borderRadius: 2,
                                minWidth: 120,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: '1px solid #f1f5f9' }}>
                            <Chip
                              label={t.type === 'credit' ? 'Credit' : 'Debit'}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: t.type === 'credit' ? exceptionGreen : errorRed,
                                color: t.type === 'credit' ? exceptionGreen : errorRed,
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Zoom>

        <Fade in timeout={1600}>
          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                background: `linear-gradient(135deg, ${primaryBlack} 0%, ${mediumGray} 100%)`,
                borderRadius: 3,
                py: 1.5,
                px: 4,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Go Back
            </Button>
          </Box>
        </Fade>
      </Box>
    </>
  );
};

export default Statement;