// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  useTheme,
  GlobalStyles,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../../context/Context';

const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const Admin = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const { getMyRequests, updateRequestStatus } = useAuth();
  const [checkRequests, setCheckRequests] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);

  const fetchRequests = async () => {
    const response = await getMyRequests();
    if (response.success && Array.isArray(response.data)) {
      const issue = response.data.filter(r => r.requestType === 'IssueCheque');
      const cancel = response.data.filter(r => r.requestType === 'CancelCheque');
      setCheckRequests(issue);
      setCancelRequests(cancel);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [getMyRequests]);

  const handleApproveCheck = async (id) => {
    const res = await updateRequestStatus(id, 'Approved');
    if (res.success) fetchRequests();
  };

  const handleRejectCheck = async (id) => {
    const res = await updateRequestStatus(id, 'Rejected');
    if (res.success) fetchRequests();
  };

  const handleApproveCancel = async (id) => {
    const res = await updateRequestStatus(id, 'Approved');
    if (res.success) fetchRequests();
  };

  const handleRejectCancel = async (id) => {
    const res = await updateRequestStatus(id, 'Rejected');
    if (res.success) fetchRequests();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderStatusChip = (status) => {
    const normalized = status?.toLowerCase();
    const label = normalized === 'pending'
      ? 'Waiting'
      : normalized === 'approved'
      ? 'Approved'
      : normalized === 'rejected'
      ? 'Refused'
      : status;
    const color = normalized === 'pending'
      ? mediumGray
      : normalized === 'approved'
      ? exceptionGreen
      : normalized === 'rejected'
      ? '#d32f2f'
      : '#999';
    return <Chip label={label} sx={{ bgcolor: color, color: '#fff', fontWeight: 600 }} />;
  };

  return (
    <>
      <GlobalStyles
        styles={{
          '._mainContent_b1piq_13': {
            marginLeft: '30px !important',
            marginTop: '30px !important',
          },
          'html, body': {
            overflow: 'auto',
            backgroundColor: '#fff',
          },
        }}
      />

      <Box sx={{ p: 3, backgroundColor: '#ffffff', minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h5" fontWeight={700} color={primaryBlack}>
            Admin Panel
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>
            <AdminPanelSettings />
          </Avatar>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 4,
            '& .MuiTab-root': { textTransform: 'none', color: mediumGray, fontWeight: 600 },
            '& .Mui-selected': { color: primaryBlack },
            '& .MuiTabs-indicator': { backgroundColor: exceptionGreen },
          }}
        >
          <Tab label="Request a checkbook" />
          <Tab label="Request to cancel a check" />
        </Tabs>

        {tabValue === 0 && (
          <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>
                Checkbook Request List
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="body2" fontWeight={600} color={primaryBlack}>Account</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600} color={primaryBlack}>Detail</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" fontWeight={600} color={primaryBlack}>Status</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" fontWeight={600} color={primaryBlack}>Action</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checkRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.customerId || '---'}</TableCell>
                        <TableCell>{request.requestDetail}</TableCell>
                        <TableCell align="center">{renderStatusChip(request.status)}</TableCell>
                        <TableCell align="center">
                          {request.status?.toLowerCase() === 'pending' && (
                            <Box display="flex" gap={1} justifyContent="center">
                              <Button variant="contained" size="small" onClick={() => handleApproveCheck(request.id)} sx={{ backgroundColor: exceptionGreen, '&:hover': { backgroundColor: '#1b5e20' }, textTransform: 'none' }}>
                                <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Approve
                              </Button>
                              <Button variant="outlined" size="small" onClick={() => handleRejectCheck(request.id)} sx={{ borderColor: '#d32f2f', color: '#d32f2f', textTransform: 'none' }}>
                                <Cancel fontSize="small" sx={{ mr: 1 }} /> Refuse
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {tabValue === 1 && (
          <Card sx={{ mb: 4, borderRadius: 2, backgroundColor: lightGray, boxShadow: theme.shadows[1], borderLeft: `4px solid ${primaryBlack}` }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>
                Check Cancellation Request List
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="body2" fontWeight={600} color={primaryBlack}>Tài khoản</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600} color={primaryBlack}>Chi tiết</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" fontWeight={600} color={primaryBlack}>Trạng thái</Typography></TableCell>
                      <TableCell align="center"><Typography variant="body2" fontWeight={600} color={primaryBlack}>Hành động</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.customerId || '---'}</TableCell>
                        <TableCell>{request.requestDetail}</TableCell>
                        <TableCell align="center">{renderStatusChip(request.status)}</TableCell>
                        <TableCell align="center">
                          {request.status?.toLowerCase() === 'pending' && (
                            <Box display="flex" gap={1} justifyContent="center">
                              <Button variant="contained" size="small" onClick={() => handleApproveCancel(request.id)} sx={{ backgroundColor: exceptionGreen, '&:hover': { backgroundColor: '#1b5e20' }, textTransform: 'none' }}>
                                <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Approve
                              </Button>
                              <Button variant="outlined" size="small" onClick={() => handleRejectCancel(request.id)} sx={{ borderColor: '#d32f2f', color: '#d32f2f', textTransform: 'none' }}>
                                <Cancel fontSize="small" sx={{ mr: 1 }} /> Refuse
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
};

export default Admin;
