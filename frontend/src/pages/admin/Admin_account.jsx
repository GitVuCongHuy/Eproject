// function Admin_account(){
//     return(<>
    
//         đây là trong quản lí tài khoản
//     </>)
// }

// export default Admin_account;


import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  Search,
  Lock,
  LockOpen,
  Edit,
  Visibility,
  Refresh,
  PersonAdd,
  FilterList
} from '@mui/icons-material';

// Component hiển thị chi tiết khách hàng
const CustomerDetailDialog = ({ open, onClose, customer }) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi tiết khách hàng</DialogTitle>
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
              label="Tên đăng nhập"
              value={customer.username || ''}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Họ và tên"
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
              label="Số điện thoại"
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
          <Grid item xs={12} sm={6}>
            <TextField
              label="Số lần đăng nhập"
              value={customer.number_login || 0}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Trạng thái"
              value={customer.locked ? 'Đã khóa' : 'Hoạt động'}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Device ID"
              value={customer.device || ''}
              fullWidth
              disabled
              multiline
            />
          </Grid>
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
      alert('Vui lòng nhập số CCCD mới');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(customer.customer_id, newCccd);
      onClose();
    } catch (error) {
      console.error('Lỗi cập nhật CCCD:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cập nhật CCCD</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Số CCCD hiện tại"
            value={customer?.citizen_identification_card || ''}
            fullWidth
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="Số CCCD mới"
            value={newCccd}
            onChange={(e) => setNewCccd(e.target.value)}
            fullWidth
            placeholder="Nhập số CCCD mới"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={handleUpdate} variant="contained" disabled={loading}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
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
        alert(`Vui lòng nhập ${field}`);
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
      console.error('Lỗi đăng ký:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Đăng ký tài khoản mới</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange('username')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Mật khẩu"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Họ và tên"
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
              label="Số điện thoại"
              value={formData.mobile}
              onChange={handleChange('mobile')}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Số CCCD"
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
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
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
        Quản lý tài khoản khách hàng
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterList sx={{ mr: 1 }} />
            Bộ lọc tìm kiếm
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Tìm theo tên"
                value={filters.fullName}
                onChange={(e) => setFilters(prev => ({ ...prev, fullName: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Tìm theo email"
                value={filters.email}
                onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Tìm theo CCCD"
                value={filters.citizenId}
                onChange={(e) => setFilters(prev => ({ ...prev, citizenId: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.lockedOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, lockedOnly: e.target.value }))}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="false">Hoạt động</MenuItem>
                  <MenuItem value="true">Đã khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Tìm kiếm">
                  <IconButton onClick={handleSearch} color="primary">
                    <Search />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Làm mới">
                  <IconButton onClick={() => { handleClearFilters(); fetchCustomers(); }}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Đăng ký tài khoản mới">
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
                <TableCell>Tên đăng nhập</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>CCCD</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Số lần login</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không có dữ liệu
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
                        label={customer.locked ? 'Đã khóa' : 'Hoạt động'}
                        color={customer.locked ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{customer.number_login}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => setDetailDialog({ open: true, customer })}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cập nhật CCCD">
                          <IconButton
                            size="small"
                            onClick={() => setUpdateCccdDialog({ open: true, customer })}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {customer.locked ? (
                          <Tooltip title="Mở khóa">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleUnlockAccount(customer.customer_id)}
                            >
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Khóa tài khoản">
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
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
          }
        />
      </Paper>

      {/* Dialogs */}
      <CustomerDetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, customer: null })}
        customer={detailDialog.customer}
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