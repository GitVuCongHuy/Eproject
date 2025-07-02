  import React, { useEffect, useState } from 'react';
  import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Chip,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
    Tooltip,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent
  } from '@mui/material';
  import { Search, Refresh, CheckCircle, Cancel } from '@mui/icons-material';
  import { useAuth } from '../../context/Context'; // Ensure the path is correct

  const AdminRequest = () => {
    const { approveChequeRequest, rejectChequeRequest } = useAuth();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalRequests, setTotalRequests] = useState(0);
    const [filters, setFilters] = useState({
      email: '',
      customerName: '',
      status: 'all'
    });

    // Call API to fetch the list of requests
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams({
          page: page + 1,
          pageSize: pageSize.toString(),
        });
        if (filters.email) queryParams.append('email', filters.email);
        if (filters.customerName) queryParams.append('customerName', filters.customerName);
        if (filters.status !== 'all') queryParams.append('status', filters.status);

        const res = await fetch(`http://localhost:5028/backend/admincheque/all-requests?${queryParams}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.status === 200) {
          setRequests(data.data || []);
          setTotalRequests(data.total || data.data.length);
          setError('');
        } else {
          setError(data.message || 'Failed to load requests.');
        }
      } catch (err) {
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchRequests();
    }, [page, pageSize]);

    const handleApprove = async (requestId) => {
      const confirm = window.confirm('Are you sure you want to approve this request?');
      if (!confirm) return;
      try {
        const res = await approveChequeRequest(requestId);
        if (res.success) {
          setSuccess(res.message);
          fetchRequests();
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Error approving request: ' + err.message);
      }
    };

    const handleReject = async (requestId) => {
      const confirm = window.confirm('Are you sure you want to reject this request?');
      if (!confirm) return;
      try {
        const res = await rejectChequeRequest(requestId);
        if (res.success) {
          setSuccess(res.message);
          fetchRequests();
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Error rejecting request: ' + err.message);
      }
    };

    const handleSearch = () => {
      setPage(0);
      fetchRequests();
    };

    const handleClearFilters = () => {
      setFilters({
        email: '',
        customerName: '',
        status: 'all'
      });
      setPage(0);
      fetchRequests();
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'Pending':
          return 'warning';
        case 'Approved':
          return 'success';
        case 'Rejected':
          return 'error';
        default:
          return 'default';
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('en-US');
    };

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Cheque Book Request Management
        </Typography>

        {/* Filter Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Search sx={{ mr: 1 }} />
              Search Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Search by email"
                  value={filters.email}
                  onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Search by customer name"
                  value={filters.customerName}
                  onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    label="Status"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Search">
                    <IconButton onClick={handleSearch} color="primary">
                      <Search />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh">
                    <IconButton onClick={handleClearFilters}>
                      <Refresh />
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
                  <TableCell><strong>Request ID</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Date Submitted</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Quantity</strong></TableCell>
                  <TableCell><strong>Delivery Address</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          No data available
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.requestId} hover>
                      <TableCell>{req.requestId}</TableCell>
                      <TableCell>{req.email || 'Unknown'}</TableCell>
                      <TableCell>{req.customerName || 'Anonymous'}</TableCell>
                      <TableCell>{formatDate(req.requestDate)}</TableCell>
                      <TableCell>{req.detail?.purpose || req.reason || 'None'}</TableCell>
                      <TableCell>{req.detail?.quantity || 'N/A'}</TableCell>
                      <TableCell>{req.detail?.deliveryAddress || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={req.status}
                          color={getStatusColor(req.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {req.status === 'Pending' ? (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Tooltip title="Approve request">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApprove(req.requestId)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject request">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleReject(req.requestId)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {req.status}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRequests}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        </Paper>

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

  export default AdminRequest;