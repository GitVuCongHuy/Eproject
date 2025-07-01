import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress,
  Container,
  GlobalStyles
} from '@mui/material';
import {
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/Context';

const PasswordField = ({ label, field, placeholder, required = true, showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }) => (
    <TextField
      fullWidth
      label={label}
      type={showPasswords[field] ? "text" : "password"}
      value={formData[field]}
      onChange={(e) => handleInputChange(field, e.target.value)}
      placeholder={placeholder}
      required={required}
      error={!!errors[field]}
      helperText={errors[field]}
      variant="outlined"
      margin="normal"
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => togglePasswordVisibility(field)}
              edge="end"
              aria-label={`toggle ${field} password visibility`}
            >
              {showPasswords[field] ? <EyeOff size={20} /> : <Eye size={20} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ mb: 2 }}
    />
);


const TransactionPasswordSettings = () => {
  const { checkTransactionPassword, createOrUpdateTransactionPassword } = useAuth();

  const [mode, setMode] = useState('create');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 6) return;

    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
    
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    }
    setSuccess('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'change' && !formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu giao dịch hiện tại';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu giao dịch mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có đúng 6 chữ số';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess('');
    setErrors({});
    
    try {
      const currentPasswordNum = parseInt(formData.currentPassword, 10);
      const newPasswordNum = parseInt(formData.newPassword, 10);

      if (mode === 'change') {
        const checkResult = await checkTransactionPassword(currentPasswordNum);
        
        if (!checkResult.success) {
          throw checkResult;
        }
      }

      const createResult = await createOrUpdateTransactionPassword(newPasswordNum);

      if (createResult.success) {
        setSuccess(createResult.message || 'Thao tác thành công!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw createResult;
      }
      
    } catch (error) {
      if (error.errorType === 'Invalid_Transaction_Password') {
        setErrors({ currentPassword: error.message || 'Mật khẩu giao dịch hiện tại không chính xác' });
      } else if (error.errorType === 'Transaction_Password_Not_Set') {
        setErrors({ general: 'Bạn chưa có mật khẩu. Vui lòng sử dụng chức năng "Tạo mật khẩu".' });
      } else {
        setErrors({ general: error.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
      }
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
     <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': { marginLeft: '30px !important', marginTop: '30px!important' },
        'html, body': { backgroundColor: '#fff', overflow:'hidden' }
      }} />
      <Container maxWidth="100vw" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Chọn hành động</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={mode === 'create' ? 'contained' : 'outlined'}
                  onClick={() => { setMode('create'); setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setErrors({}); setSuccess(''); }}
                  startIcon={<Shield size={20} />}
                >
                  Tạo mật khẩu giao dịch
                </Button>
                <Button
                  variant={mode === 'change' ? 'contained' : 'outlined'}
                  onClick={() => { setMode('change'); setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setErrors({}); setSuccess(''); }}
                  startIcon={<Lock size={20} />}
                >
                  Đổi mật khẩu giao dịch
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={28} style={{ color: '#1976d2' }} />
              </Box>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>{mode === 'change' ? 'Đổi mật khẩu giao dịch' : 'Tạo mật khẩu giao dịch'}</Typography>
                <Typography variant="body1" color="text.secondary">{mode === 'change' ? 'Cập nhật mật khẩu giao dịch của bạn để bảo mật tài khoản' : 'Tạo mật khẩu giao dịch để bảo vệ các giao dịch quan trọng'}</Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Lock size={16} />Lưu ý bảo mật</Box>
              </AlertTitle>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>Mật khẩu giao dịch phải là 6 chữ số và khác với mật khẩu đăng nhập.</li>
                <li>Không chia sẻ mật khẩu này với bất kỳ ai.</li>
              </Box>
            </Alert>

            {success && (<Alert severity="success" sx={{ mb: 3 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle size={16} />{success}</Box></Alert>)}
            {errors.general && (<Alert severity="error" sx={{ mb: 3 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><AlertTriangle size={16} />{errors.general}</Box></Alert>)}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {mode === 'change' && (
                <PasswordField
                  label="Mật khẩu giao dịch hiện tại"
                  field="currentPassword"
                  placeholder="Nhập mật khẩu giao dịch hiện tại"
                  {...{ showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }}
                />
              )}
              <PasswordField
                label="Mật khẩu giao dịch mới (6 chữ số)"
                field="newPassword"
                placeholder="Nhập mật khẩu giao dịch mới"
                {...{ showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }}
              />
              <PasswordField
                label="Xác nhận mật khẩu mới"
                field="confirmPassword"
                placeholder="Nhập lại mật khẩu giao dịch mới"
                {...{ showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress color="inherit" size={20} /> : <Shield size={20} />}
                sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
              >
                {loading ? 'Đang xử lý...' : (mode === 'change' ? 'Cập nhật mật khẩu' : 'Tạo mật khẩu giao dịch')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

const TransactionPasswordPage = () => {

    return <TransactionPasswordSettings />;
}

export default TransactionPasswordSettings;