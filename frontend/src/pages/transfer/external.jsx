import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Switch, Divider, Grid, Card, CardContent, Alert, CircularProgress, InputAdornment,
  IconButton, GlobalStyles, Select, MenuItem, InputLabel, ListItemText,
  // <<< 1. Thêm các component cho Modal
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { ContentCopy, Person } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom'; // <<< 2. Thêm useNavigate để chuyển trang
import { useAuth } from '../../context/context';

const BankTransferPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // <<< 3. Khởi tạo navigate

  // <<< 4. Lấy tất cả các hàm API cần thiết từ context
  const { getCards, bankTransfer, checkTransactionPassword, sendOTP, verifyOTP } = useAuth();

  const { cardNumber, beneficiaryName } = location.state || {};

  // State cho tài khoản nguồn
  const [fromAccounts, setFromAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // State cho form chính
  const [formData, setFormData] = useState({
    beneficiaryBank: 'MB',
    beneficiaryBankName: 'Ngân hàng TMCP Quân Đội',
    transferType: 'fast',
    accountNumber: cardNumber || '',
    beneficiaryName: beneficiaryName || '',
    saveRecipient: true,
    amount: '',
    transferNote: ''
  });
  
  // <<< 5. Thêm các state để quản lý Modal và luồng xác thực
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Nhập MK giao dịch, 2: Nhập OTP
  const [transactionPassword, setTransactionPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  // State cho trang chính
  const [loading, setLoading] = useState(false); // Loading này hiện không dùng, isModalLoading quan trọng hơn
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // useEffect để lấy danh sách tài khoản (không đổi)
  useEffect(() => {
    const fetchFromAccounts = async () => {
      setLoadingAccounts(true);
      const result = await getCards();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setFromAccounts(result.data);
        setSelectedAccount(result.data[0].account_id);
        setError('');
      } else {
        if (!result.success) {
            setError(result.message || 'Lỗi: không thể tải danh sách tài khoản của bạn.');
        } else {
            setError('Bạn chưa có tài khoản thanh toán nào để thực hiện giao dịch.');
        }
      }
      setLoadingAccounts(false);
    };
    fetchFromAccounts();
    if (!cardNumber) {
      console.warn("Trang này không nhận được thông tin người nhận.");
    }
  }, [getCards, cardNumber]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectAccount = (event) => {
    setSelectedAccount(event.target.value);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };

  // <<< 6. Sửa lại handleSubmit: Chỉ mở Modal, không làm gì khác
  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra dữ liệu cơ bản
    if (!formData.amount || Number(formData.amount) <= 1000) {
        setError("Số tiền không hợp lệ. Vui lòng nhập số tiền lớn hơn 1,000 VND.");
        return;
    }
    setError(''); // Xóa lỗi cũ
    setSuccess(''); // Xóa thành công cũ
    setModalStep(1); // Bắt đầu ở bước 1
    setIsConfirmModalOpen(true); // Mở modal
  };

  const handleCloseModal = () => {
      setIsConfirmModalOpen(false);
      // Reset tất cả state của modal để lần mở sau được sạch sẽ
      setTimeout(() => {
          setModalStep(1);
          setTransactionPassword('');
          setOtp('');
          setModalError('');
          setIsModalLoading(false);
      }, 300); // Đợi modal đóng xong mới reset
  }

  // <<< 7. Hàm xử lý bước 1: Kiểm tra mật khẩu giao dịch
  const handlePasswordSubmit = async () => {
    setIsModalLoading(true);
    setModalError('');

    const result = await checkTransactionPassword(Number(transactionPassword));

    if(result.success) {
        // Mật khẩu đúng, gửi OTP và chuyển sang bước 2
        await sendOTP(); // Không cần check kết quả, cứ gửi đi
        setModalStep(2);
    } else {
        // Mật khẩu sai, hiển thị lỗi trong modal
        setModalError(result.message || "Mật khẩu giao dịch không chính xác.");
    }
    setIsModalLoading(false);
  }

  // <<< 8. Hàm xử lý bước 2: Xác thực OTP và thực hiện chuyển tiền
  const handleFinalSubmit = async () => {
    setIsModalLoading(true);
    setModalError('');

    // Bước 2.1: Xác thực OTP
    const otpResult = await verifyOTP(otp);
    if(!otpResult.success) {
        setModalError(otpResult.message || "Mã OTP không hợp lệ.");
        setIsModalLoading(false);
        return; // Dừng lại nếu OTP sai
    }
    
    // Bước 2.2: OTP đúng, tiến hành chuyển tiền
    const senderCard = fromAccounts.find(acc => acc.account_id === selectedAccount);
    const transferDetails = {
      senderAccount: senderCard.cardNumber,
      receiverAccount: formData.accountNumber,
      amount: Number(formData.amount),
      description: formData.transferNote || `Chuyen khoan toi ${formData.beneficiaryName}`,
      transactionPassword: Number(transactionPassword) // Dùng lại mật khẩu đã xác thực
    };
    
    const transferResult = await bankTransfer(transferDetails);

    if(transferResult.success) {
        setSuccess(transferResult.message || "Giao dịch thành công!");
        handleCloseModal(); // Đóng modal
        // Reset form và chuyển trang sau 3s
        setTimeout(() => navigate('/'), 3000); // Thay '/dashboard' bằng trang bạn muốn
    } else {
        // Nếu có lỗi từ server (số dư, tài khoản...), hiển thị ở trang chính
        setError(transferResult.message || "Giao dịch không thành công. Vui lòng thử lại.");
        handleCloseModal();
    }
    setIsModalLoading(false);
  }


  const currentAccountDetails = fromAccounts.find(acc => acc.account_id === selectedAccount);

  return (
    <>
      <GlobalStyles styles={{ '._mainContent_b1piq_13': { marginLeft: '30px !important', marginTop: '30px!important', }, 'html, body': { overflow: 'auto', backgroundColor: '#fff', }, }} />
      <Box sx={{ maxWidth: 2000, mx: 'auto', p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Chuyển tiền tới ngân hàng khác
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* Form chính không thay đổi nhiều, chỉ có hàm onSubmit */}
          <form onSubmit={handleSubmit}>
            {/* ... các trường input không đổi ... */}
             <Box sx={{ mb: 3 }}><FormControl component="fieldset"><FormLabel component="legend" sx={{ mb: 1, color: 'text.secondary' }}> Lựa chọn phương thức chuyển tiền </FormLabel><RadioGroup row value={formData.transferType} onChange={handleInputChange('transferType')}><FormControlLabel value="fast" control={<Radio />} label="Chuyển nhanh Napas 24/7" /><FormControlLabel value="normal" control={<Radio />} label="Chuyển thường" /></RadioGroup></FormControl></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Số tài khoản người nhận </Typography><TextField fullWidth value={formData.accountNumber} InputProps={{ startAdornment: ( <InputAdornment position="start"> <Person color="action" /> </InputAdornment> ), endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => copyToClipboard(formData.accountNumber)} size="small"> <ContentCopy /> </IconButton> </InputAdornment> ), readOnly: true, }} variant="outlined" /></Box>
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Tên người nhận </Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><TextField fullWidth value={formData.beneficiaryName} variant="outlined" sx={{ flexGrow: 1 }} InputProps={{ readOnly: true }} /><FormControlLabel control={ <Switch checked={formData.saveRecipient} onChange={handleInputChange('saveRecipient')} /> } label="Lưu người nhận" /></Box></Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 3 }}><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Từ tài khoản </Typography>{loadingAccounts ? ( <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}> <CircularProgress size={24} /> <Typography>Đang tải tài khoản...</Typography> </Box> ) : fromAccounts.length > 0 ? (<Card variant="outlined"><CardContent sx={{ p: 2 }}><Grid container spacing={2} alignItems="center"><Grid item xs={12} sm={7}><FormControl fullWidth variant="outlined"><InputLabel id="from-account-select-label">Tài khoản nguồn</InputLabel><Select labelId="from-account-select-label" value={selectedAccount} onChange={handleSelectAccount} label="Tài khoản nguồn">{fromAccounts.map((acc) => (<MenuItem key={acc.account_id} value={acc.account_id}><ListItemText primary={`TKTT - ${acc.cardNumber}`} secondary={`${acc.balance.toLocaleString('vi-VN')} VND`} /></MenuItem>))}</Select></FormControl></Grid><Grid item xs={12} sm={5}><Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', textAlign: { sm: 'right', xs: 'left' } }}>{currentAccountDetails && `Số dư: ${currentAccountDetails.balance.toLocaleString('vi-VN')} VND`}</Typography></Grid></Grid></CardContent></Card>) : (<></>)}</Box>
            <Grid container spacing={2} sx={{ mb: 3 }}><Grid item xs={12}><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Số tiền </Typography><TextField fullWidth value={formData.amount} onChange={handleInputChange('amount')} InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment>, }} variant="outlined" type="number" required /></Grid></Grid>
            <Box sx={{ mb: 4 }}><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}> Lời nhắn </Typography><TextField fullWidth multiline rows={2} value={formData.transferNote} onChange={handleInputChange('transferNote')} variant="outlined" placeholder="Nhập lời nhắn (tùy chọn)" /></Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="submit" variant="contained" size="large" disabled={loading || loadingAccounts || !currentAccountDetails || !!success} sx={{ minWidth: 200, py: 1.5, borderRadius: 3, textTransform: 'none', fontSize: '1.1rem' }}>
                Tiếp tục
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* <<< 9. Thêm Modal xác nhận giao dịch */}
      <Dialog open={isConfirmModalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        {modalStep === 1 ? (
            // View 1: Nhập mật khẩu giao dịch
            <>
                <DialogTitle fontWeight="bold">Xác nhận Mật khẩu giao dịch</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Để đảm bảo an toàn, vui lòng nhập mật khẩu giao dịch của bạn.
                    </DialogContentText>
                    <TextField autoFocus margin="dense" id="transactionPassword" label="Mật khẩu giao dịch" type="password" fullWidth variant="outlined" value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)} error={!!modalError} helperText={modalError} onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} disabled={isModalLoading}>Hủy</Button>
                    <Button onClick={handlePasswordSubmit} variant="contained" disabled={isModalLoading || !transactionPassword}>
                        {isModalLoading ? <CircularProgress size={24} /> : "Xác nhận"}
                    </Button>
                </DialogActions>
            </>
        ) : (
            // View 2: Nhập OTP
            <>
                <DialogTitle fontWeight="bold">Xác thực Giao dịch</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã để hoàn tất.
                    </DialogContentText>
                    <Box sx={{ my: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant='body2'>Tới: <strong>{formData.beneficiaryName}</strong></Typography>
                        <Typography variant='body2'>STK: <strong>{formData.accountNumber}</strong></Typography>
                        <Typography variant='h6' color="primary">Số tiền: <strong>{Number(formData.amount).toLocaleString('vi-VN')} VND</strong></Typography>
                    </Box>
                    <TextField autoFocus margin="dense" id="otp" label="Mã OTP" type="text" fullWidth variant="outlined" value={otp} onChange={(e) => setOtp(e.target.value)} error={!!modalError} helperText={modalError} onKeyPress={(e) => e.key === 'Enter' && handleFinalSubmit()}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} disabled={isModalLoading}>Hủy</Button>
                    <Button onClick={handleFinalSubmit} variant="contained" disabled={isModalLoading || !otp}>
                        {isModalLoading ? <CircularProgress size={24} /> : "Hoàn tất giao dịch"}
                    </Button>
                </DialogActions>
            </>
        )}
      </Dialog>
    </>
  );
};

export default BankTransferPage;