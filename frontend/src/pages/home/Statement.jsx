import React from 'react';
import {  Box,  Typography,  Card,  CardContent, Button,  Avatar,  Chip,  useTheme,  GlobalStyles,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper} from '@mui/material';
import {  Receipt,  ArrowUpward,  ArrowDownward,  ChevronRight} from '@mui/icons-material';

// --- Bảng màu từ Home ---
const primaryBlack = '#333';
const mediumGray = '#757575';
const exceptionGreen = '#2e7d32';
const lightGray = '#fafafa';

const Statement = () => {
  const theme = useTheme();

  // Sample transaction data
  const transactions = [
    {
      date: '01/06/2025',
      description: 'Lãi suất tài khoản tháng 05/2025',
      amount: '+5',
      type: 'credit',
    },
    {
      date: '27/04/2025',
      description: 'Lãi suất tài khoản tháng 04/2025',
      amount: '+4',
      type: 'credit',
    },
    {
      date: '15/04/2025',
      description: 'Chuyển khoản đến Nguyễn Văn A',
      amount: '-50',
      type: 'debit',
    },
    {
      date: '10/04/2025',
      description: 'Thanh toán hóa đơn điện',
      amount: '-20',
      type: 'debit',
    },
    {
      date: '10/04/2025',
      description: 'Thanh toán hóa đơn điện',
      amount: '-20',
      type: 'debit',
    },{
      date: '10/04/2025',
      description: 'Thanh toán hóa đơn điện',
      amount: '-20',
      type: 'debit',
    },
  ];

  return (
    <>
      {/* Override class bên ngoài */}
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': {
          marginLeft: '30px !important',
          marginTop: '30px!important',
        },
        'html, body': {
          overflow: 'auto',
          backgroundColor: '#fff',
        },
      }} />

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
            Sao kê giao dịch
          </Typography>
          <Avatar sx={{ bgcolor: primaryBlack, width: 42, height: 42 }}>VH</Avatar>
        </Box>

        {/* Transaction Table */}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600} color={primaryBlack}>
                Lịch sử giao dịch
              </Typography>
              <Button
                variant="text"
                endIcon={<ChevronRight fontSize="small" />}
                sx={{ textTransform: 'none', color: primaryBlack }}
              >
                Tải xuống
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                        Ngày
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                        Mô tả
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                        Số tiền (VND)
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={600} color={primaryBlack}>
                        Loại
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              bgcolor: transaction.type === 'credit' ? exceptionGreen : mediumGray,
                              color: '#fff',
                              width: 32,
                              height: 32,
                            }}
                          >
                            {transaction.type === 'credit' ? <ArrowUpward /> : <ArrowDownward />}
                          </Avatar>
                          <Typography variant="body2">{transaction.description}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={transaction.amount}
                          sx={{
                            bgcolor: transaction.type === 'credit' ? exceptionGreen : mediumGray,
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {transaction.type === 'credit' ? 'Tiền vào' : 'Tiền ra'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: primaryBlack,
              '&:hover': {
                backgroundColor: '#000',
              },
              borderRadius: 5,
            }}
          >
            Quay lại
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Statement;