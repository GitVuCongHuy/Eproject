import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Lock,
  LockOpen,
  Edit,
  Visibility,
  Refresh,
  PersonAdd,
  FilterList,
  CreditCard,
  AccountBalance,
  Add,
  Delete
} from '@mui/icons-material';


// Component hiển thị danh sách thẻ của khách hàng
const CustomerCardsDialog = ({ open, onClose, customer }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createCardOpen, setCreateCardOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

 const fetchCustomerCards = async () => {
  if (!customer?.customer_id) return;

  setLoading(true);
  setError('');

  try {
    const response = await axios.get(
      `http://localhost:5028/backend/accounts_manager/get-accounts-by-customer`,
      { params: { customerId: customer.customer_id } }
    );

    const data = response.data;

    if (response.status === 200 && data.status === 200) {
      setCards(data.data || []);
    } else {
      setError(data.message || 'Lỗi khi tải danh sách thẻ');
    }
  } catch (error) {
    setError('Lỗi kết nối: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

 const handleDeleteCard = async (cardId) => {
  try {
    const response = await axios.delete(
      `http://localhost:5028/backend/accounts_manager/admin_delete-card/${cardId}`
    );

    const data = response.data;

    if (response.status === 200 && data.status === 200) {
      setSnackbar({ open: true, message: 'Card deleted successfully!', severity: 'success' });
      fetchCustomerCards();
    } else {
      let errorMessage = 'Error while deleting card';

      switch (data.error) {
        case 'NotFound':
          errorMessage = 'Card not found';
          break;
        case 'NonZeroBalance':
          errorMessage = 'Cards are usually only cleared when the balance is 0.';
          break;
        case 'InvalidCreditBalance':
          errorMessage = 'Debit card will only be cleared when the balance is 10,000,000 (principal)';
          break;
        case 'UnknownCardType':
          errorMessage = 'Unknown card type';
          break;
        default:
          errorMessage = data.message || errorMessage;
      }

      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    setSnackbar({ open: true, message: 'Lỗi kết nối: ' + message, severity: 'error' });
  }

  setDeleteCardId(null);
};

  useEffect(() => {
    if (open && customer) {
      fetchCustomerCards();
    }
  }, [open, customer]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getCardTypeColor = (cardType) => {
    switch (cardType) {
      case 'Credit':
        return 'warning';
      case 'Normal':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Suspended':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(balance);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              Customer card list: {customer?.full_name}
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateCardOpen(true)}
              size="small"
            >
              Create a new card
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : cards.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Khách hàng chưa có thẻ nào
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Account ID</strong></TableCell>
                    <TableCell><strong>Card number</strong></TableCell>
                    <TableCell><strong>Card type</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    {/* <TableCell><strong>Số dư</strong></TableCell> */}
                    <TableCell><strong>Release date</strong></TableCell>
                    <TableCell><strong>Operation</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cards.map((card, index) => (
                    <TableRow key={card.account_id || index} hover>
                      <TableCell>{card.account_id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {card.cardNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.cardType}
                          color={getCardTypeColor(card.cardType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.status}
                          color={getStatusColor(card.status)}
                          size="small"
                        />
                      </TableCell>
                      {/* <TableCell>
                        <Typography variant="body2" color={card.balance >= 0 ? 'success.main' : 'error.main'}>
                          {formatBalance(card.balance)}
                        </Typography>
                      </TableCell> */}
                      <TableCell>
                        {formatDate(card.creditIssuedDate)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteCardId(card.account_id)}
                          title="Xóa thẻ"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {cards.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total number of cards:</strong> {cards.length}/3 card
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button 
            onClick={fetchCustomerCards} 
            startIcon={<Refresh />}
            disabled={loading}
          >
            Refresh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Card Dialog */}
      <CreateCardDialog
        open={createCardOpen}
        onClose={() => setCreateCardOpen(false)}
        customer={customer}
        onSuccess={() => {
          fetchCustomerCards();
          setSnackbar({ open: true, message: 'Card created successfully!', severity: 'success' });
        }}
        onError={(message) => setSnackbar({ open: true, message, severity: 'error' })}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteCardId !== null}
        onClose={() => setDeleteCardId(null)}
      >
        <DialogTitle>Confirm card deletion</DialogTitle>
        <DialogContent>
          <Typography>
           Are you sure you want to delete this card? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Note:</strong>
            <br />• Cards are usually only deleted when the balance is 0.
            <br />• Debit card will only be deleted when the balance is 10,000,000 VND (principal)
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCardId(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteCard(deleteCardId)}
            color="error"
            variant="contained"
          >
           Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Create Card Dialog Component
const CreateCardDialog = ({ open, onClose, customer, onSuccess, onError }) => {
  const [cardType, setCardType] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cardType) {
      onError('Please select card type');
      return;
    }

    if (cardType === 'Normal' && (!initialBalance || parseFloat(initialBalance) < 0)) {
      onError('Please enter a valid starting balance for the regular card.');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        customer_id: customer.customer_id,
        CardType: cardType,
        ...(cardType === 'Normal' && { InitialBalance: parseFloat(initialBalance) })
      };

      const response = await fetch('http://localhost:5028/backend/accounts_manager/admin_create-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        onSuccess();
        handleClose();
      } else {
        let errorMessage = 'Error creating card';
        
        // Xử lý các loại lỗi cụ thể
        switch (data.error) {
          case 'NotFound':
            errorMessage = 'No customers found';
            break;
          case 'AccountLocked':
            errorMessage = 'Account has been locked';
            break;
          case 'InvalidCardType':
            errorMessage = 'Invalid card type (Normal or Credit)';
            break;
          case 'CardLimitReached':
            errorMessage = 'Total number of cards cannot exceed 3';
            break;
          case 'CreditCardLimit':
            errorMessage = 'Only 1 debit card can be created';
            break;
          default:
            errorMessage = data.message || errorMessage;
        }
        
        onError(errorMessage);
      }
    } catch (error) {
      onError('Connection error:' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCardType('');
    setInitialBalance('');
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add />
          Create new tag for: {customer?.full_name}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Card type</InputLabel>
            <Select
              value={cardType}
              label="Card type"
              onChange={(e) => setCardType(e.target.value)}
            >
              <MenuItem value="Normal">Regular card</MenuItem>
              <MenuItem value="Credit">Debit card</MenuItem>
            </Select>
          </FormControl>

          {cardType === 'Normal' && (
            <TextField
              fullWidth
              label="Initial balance"
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              InputProps={{
                inputProps: { min: 0 }
              }}
              helperText="Enter the starting balance for the regular card"
            />
          )}

          {cardType === 'Credit' && (
            <Alert severity="info">
              The debit card will be created with a default balance of 10,000,000 VND
            </Alert>
          )}

          <Alert severity="warning">
            <strong>Note:</strong>
            <br />• Maximum 3 cards per customer
            <br />• Only 1 debit card can be created
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !cardType}
          startIcon={loading ? <CircularProgress size={20} /> : <Add />}
        >
          {loading ? 'Creating...' : 'Create tags'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Component hiển thị chi tiết khách hàng
const CustomerDetailDialog = ({ open, onClose, customer }) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Customer details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="ID"
              value={customer.customer_id || ''}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Login name"
              value={customer.username || ''}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Full name"
              value={customer.full_name || ''}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              value={customer.email || ''}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone number"
              value={customer.mobile || ''}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="CCCD"
              value={customer.citizen_identification_card || ''}
              fullWidth
              disabled
            />
          </Grid>
          {/* <Grid item xs={12} sm={6}>
            <TextField
              label="Số lần đăng nhập"
              value={customer.number_login || 0}
              fullWidth
              disabled
            />
          </Grid> */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Status"
              value={customer.locked ? 'Locked' : 'Work'}
              fullWidth
              disabled
            />
          </Grid>
          {/* <Grid item xs={12}>
            <TextField
              label="Device ID"
              value={customer.device || ''}
              fullWidth
              disabled
              multiline
            />
          </Grid> */}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Component cập nhật CCCD
const UpdateCccdDialog = ({ open, onClose, customer, onUpdate }) => {
  const [newCccd, setNewCccd] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setNewCccd(customer.citizen_identification_card || '');
    }
  }, [customer]);

  const handleUpdate = async () => {
    if (!newCccd.trim()) {
      alert('Please enter new CCCD number');
      return;
    }
a
    setLoading(true);
    try {
      await onUpdate(customer.customer_id, newCccd);
      onClose();
    } catch (error) {
      console.error('Error updating CCCD:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update CCCD</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Current ID number"
            value={customer?.citizen_identification_card || ''}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="New CCCD number"
            value={newCccd}
            onChange={(e) => setNewCccd(e.target.value)}
            fullWidth
            placeholder="Enter new CCCD number"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleUpdate} variant="contained" disabled={loading}>
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Component đăng ký tài khoản mới
const RegisterDialog = ({ open, onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    mobile: '',
    citizenIdentificationCard: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    // Validation cơ bản
    const required = ['username', 'password', 'fullName', 'email', 'mobile', 'citizenIdentificationCard'];
    for (let field of required) {
      if (!formData[field].trim()) {
        alert(`Please enter ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      await onRegister(formData);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        mobile: '',
        citizenIdentificationCard: ''
      });
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Register new account</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Login name"
              value={formData.username}
              onChange={handleChange('username')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Full name"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone number"
              value={formData.mobile}
              onChange={handleChange('mobile')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="CCCD number"
              value={formData.citizenIdentificationCard}
              onChange={handleChange('citizenIdentificationCard')}
              fullWidth
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Component chính
const Admin_account = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Search filters
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    citizenId: '',
    lockedOnly: 'all'
  });
  
  // Dialog states
  const [detailDialog, setDetailDialog] = useState({ open: false, customer: null });
  const [updateCccdDialog, setUpdateCccdDialog] = useState({ open: false, customer: null });
  const [registerDialog, setRegisterDialog] = useState(false);
  const [cardsDialog, setCardsDialog] = useState({ open: false, customer: null });

  // API functions
  const apiCall = async (url, method = 'GET', body = null) => {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`http://localhost:5028${url}`, options);
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams({
        page: page + 1,
        pageSize: pageSize.toString(),
      });
      
      if (filters.fullName) queryParams.append('fullName', filters.fullName);
      if (filters.email) queryParams.append('email', filters.email);
      if (filters.citizenId) queryParams.append('citizenId', filters.citizenId);
      if (filters.lockedOnly !== 'all') queryParams.append('lockedOnly', filters.lockedOnly);
      
      const response = await apiCall(`/backend/customer/filter-customers?${queryParams}`);
      
      if (response.status === 200) {
        setCustomers(response.data.customers || []);
        setTotalCustomers(response.data.totalCustomers || 0);
      }
    } catch (error) {
      setError('Lỗi khi tải danh sách khách hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLockAccount = async (customerId) => {
    try {
      const response = await apiCall(`/backend/customer/lock/${customerId}`, 'PUT');
      if (response.status === 200) {
        setSuccess('Khóa tài khoản thành công');
        fetchCustomers();
      }
    } catch (error) {
      setError('Lỗi khi khóa tài khoản: ' + error.message);
    }
  };

  const handleUnlockAccount = async (customerId) => {
    try {
      const response = await apiCall(`/backend/customer/unlock/${customerId}`, 'PUT');
      if (response.status === 200) {
        setSuccess('Mở khóa tài khoản thành công');
        fetchCustomers();
      }
    } catch (error) {
      setError('Lỗi khi mở khóa tài khoản: ' + error.message);
    }
  };

  const handleUpdateCccd = async (customerId, newCccd) => {
    try {
      const response = await apiCall(`/backend/customer/update-cccd/${customerId}`, 'PUT', {
        NewCccd: newCccd
      });
      if (response.status === 200) {
        setSuccess('Cập nhật CCCD thành công');
        fetchCustomers();
      }
    } catch (error) {
      setError('Lỗi khi cập nhật CCCD: ' + error.message);
    }
  };

  const handleRegister = async (formData) => {
    try {
      const response = await apiCall('/backend/customer/register', 'POST', formData);
      setSuccess('Đăng ký tài khoản thành công');
      fetchCustomers();
    } catch (error) {
      setError('Lỗi khi đăng ký tài khoản: ' + error.message);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchCustomers();
  };

  const handleClearFilters = () => {
    setFilters({
      fullName: '',
      email: '',
      citizenId: '',
      lockedOnly: 'all'
    });
    setPage(0);
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Customer account management
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1 }} />
            Search filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Search by name"
                value={filters.fullName}
                onChange={(e) => setFilters(prev => ({ ...prev, fullName: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Search by email"
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Search by CCCD"
                value={filters.citizenId}
                onChange={(e) => setFilters(prev => ({ ...prev, citizenId: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.lockedOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, lockedOnly: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="false">Work</MenuItem>
                  <MenuItem value="true">Locked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Search">
                  <IconButton onClick={handleSearch} color="primary">
                    <Search />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh">
                  <IconButton onClick={() => { handleClearFilters(); fetchCustomers(); }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Register new account">
                  <IconButton onClick={() => setRegisterDialog(true)} color="success">
                    <PersonAdd />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Login name</TableCell>
                <TableCell>Full name</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Phone number</TableCell>
                <TableCell>CCCD</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Number of login times</TableCell>
                <TableCell align="center">Operation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.customer_id} hover>
                    <TableCell>{customer.customer_id}</TableCell>
                    <TableCell>{customer.username}</TableCell>
                    <TableCell>{customer.full_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>{customer.citizen_identification_card}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.locked ? 'Locked' : 'Work'}
                        color={customer.locked ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{customer.number_login}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Tooltip title="See details">
                          <IconButton
                            size="small"
                            onClick={() => setDetailDialog({ open: true, customer })}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View tag list">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => setCardsDialog({ open: true, customer })}
                          >
                            <CreditCard />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update CCCD">
                          <IconButton
                            size="small"
                            onClick={() => setUpdateCccdDialog({ open: true, customer })}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {customer.locked ? (
                          <Tooltip title="Unlock">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleUnlockAccount(customer.customer_id)}
                            >
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Lock account">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleLockAccount(customer.customer_id)}
                            >
                              <Lock />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={totalCustomers}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Number of lines per page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} belong to ${count !== -1 ? count : `than ${to}`}`
          }
        />
      </Paper>

      {/* Dialogs */}
      <CustomerDetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, customer: null })}
        customer={detailDialog.customer}
      />

      <CustomerCardsDialog
        open={cardsDialog.open}
        onClose={() => setCardsDialog({ open: false, customer: null })}
        customer={cardsDialog.customer}
      />

      <UpdateCccdDialog
        open={updateCccdDialog.open}
        onClose={() => setUpdateCccdDialog({ open: false, customer: null })}
        customer={updateCccdDialog.customer}
        onUpdate={handleUpdateCccd}
      />

      <RegisterDialog
        open={registerDialog}
        onClose={() => setRegisterDialog(false)}
        onRegister={handleRegister}
      />

      {/* Notifications */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};



export default Admin_account;