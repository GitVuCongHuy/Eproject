import React, { useState } from 'react';
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

// --- Bảng màu từ các trang trước ---
const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const Admin = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Dữ liệu mẫu cho yêu cầu sổ séc
  const [checkRequests, setCheckRequests] = useState([
    {
      id: 1,
      accountNumber: '1907 1903 0300 17',
      checkQuantity: '25',
      deliveryAddress: '123 Đường Láng, Hà Nội',
      status: 'pending',
    },
    {
      id: 2,
      accountNumber: '1907 1903 0300 18',
      checkQuantity: '50',
      deliveryAddress: '456 Lê Lợi, TP.HCM',
      status: 'pending',
    },
    {
      id: 3,
      accountNumber: '1907 1903 0300 19',
      checkQuantity: '100',
      deliveryAddress: '789 Nguyễn Huệ, Đà Nẵng',
      status: 'approved',
    },
  ]);

  // Dữ liệu mẫu cho yêu cầu hủy séc
  const [cancelRequests, setCancelRequests] = useState([
    {
      id: 1,
      accountNumber: '1907 1903 0300 17',
      checkNumber: 'CHK123456',
      status: 'pending',
    },
    {
      id: 2,
      accountNumber: '1907 1903 0300 18',
      checkNumber: 'CHK789012',
      status: 'pending',
    },
    {
      id: 3,
      accountNumber: '1907 1903 0300 19',
      checkNumber: 'CHK345678',
      status: 'rejected',
    },
  ]);

  const handleApproveCheck = (id) => {
    setCheckRequests(
      checkRequests.map((req) =>
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleRejectCheck = (id) => {
    setCheckRequests(
      checkRequests.map((req) =>
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleApproveCancel = (id) => {
    setCancelRequests(
      cancelRequests.map((req) =>
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
  };

  const handleRejectCancel = (id) => {
    setCancelRequests(
      cancelRequests.map((req) =>
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      {/* Override class bên ngoài */}
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

      {/* Main container */}
      <Box
        sx={{
          p: 3,
          backgroundColor: '#ffffff',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight={700} color={primaryBlack}>
            Bảng điều khiển quản trị
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>
            <AdminPanelSettings />
          </Avatar>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 4,
            '& .MuiTab-root': {
              textTransform: 'none',
              color: mediumGray,
              fontWeight: 600,
            },
            '& .Mui-selected': {
              color: primaryBlack,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: exceptionGreen,
            },
          }}
        >
          <Tab label="Yêu cầu sổ séc" />
          <Tab label="Yêu cầu hủy séc" />
        </Tabs>

        {/* Check Requests Table */}
        {tabValue === 0 && (
          <Card
            sx={{
              mb: 4,
              borderRadius: 2,
              backgroundColor: lightGray,
              boxShadow: theme.shadows[1],
              borderLeft: `4px solid ${primaryBlack}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>
                Danh sách yêu cầu sổ séc
              </Typography>

              <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Tài khoản
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Số lượng tờ séc
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Địa chỉ giao
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Trạng thái
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Hành động
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {checkRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {request.accountNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {request.checkQuantity} tờ
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {request.deliveryAddress}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              request.status === 'pending'
                                ? 'Đang chờ'
                                : request.status === 'approved'
                                ? 'Đã phê duyệt'
                                : 'Đã từ chối'
                            }
                            sx={{
                              bgcolor:
                                request.status === 'pending'
                                  ? mediumGray
                                  : request.status === 'approved'
                                  ? exceptionGreen
                                  : '#d32f2f',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {request.status === 'pending' && (
                            <Box display="flex" gap={1} justifyContent="center">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleApproveCheck(request.id)}
                                sx={{
                                  backgroundColor: exceptionGreen,
                                  '&:hover': {
                                    backgroundColor: '#1b5e20',
                                  },
                                  textTransform: 'none',
                                }}
                              >
                                <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                                Phê duyệt
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleRejectCheck(request.id)}
                                sx={{
                                  borderColor: '#d32f2f',
                                  color: '#d32f2f',
                                  textTransform: 'none',
                                }}
                              >
                                <Cancel fontSize="small" sx={{ mr: 1 }} />
                                Từ chối
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

        {/* Cancel Check Requests Table */}
        {tabValue === 1 && (
          <Card
            sx={{
              mb: 4,
              borderRadius: 2,
              backgroundColor: lightGray,
              boxShadow: theme.shadows[1],
              borderLeft: `4px solid ${primaryBlack}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} color={primaryBlack} mb={2}>
                Danh sách yêu cầu hủy séc
              </Typography>

              <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Tài khoản
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Số séc
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Trạng thái
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                          Hành động
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cancelRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {request.accountNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {request.checkNumber}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              request.status === 'pending'
                                ? 'Đang chờ'
                                : request.status === 'approved'
                                ? 'Đã phê duyệt'
                                : 'Đã từ chối'
                            }
                            sx={{
                              bgcolor:
                                request.status === 'pending'
                                  ? mediumGray
                                  : request.status === 'approved'
                                  ? exceptionGreen
                                  : '#d32f2f',
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {request.status === 'pending' && (
                            <Box display="flex" gap={1} justifyContent="center">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleApproveCancel(request.id)}
                                sx={{
                                  backgroundColor: exceptionGreen,
                                  '&:hover': {
                                    backgroundColor: '#1b5e20',
                                  },
                                  textTransform: 'none',
                                }}
                              >
                                <CheckCircle fontSize="small" sx={{ mr: 1 }} />
                                Phê duyệt
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleRejectCancel(request.id)}
                                sx={{
                                  borderColor: '#d32f2f',
                                  color: '#d32f2f',
                                  textTransform: 'none',
                                }}
                              >
                                <Cancel fontSize="small" sx={{ mr: 1 }} />
                                Từ chối
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