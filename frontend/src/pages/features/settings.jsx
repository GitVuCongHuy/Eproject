import React, { useState, useCallback } from 'react';
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
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/context'; // chỉnh path nếu khác

const PasswordField = React.memo(({
  label,
  field,
  placeholder,
  required,
  showPasswords,
  formData,
  errors,
  togglePasswordVisibility,
  handleInputChange
}) => (
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
));

const TransactionPasswordSettings = () => {
  const { checkTransactionPassword, createOrUpdateTransactionPassword } = useAuth();
  const [mode, setMode] = useState('create');
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    if (mode === 'change' && !formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu giao dịch hiện tại';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu giao dịch mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSuccess('');
    setErrors({});
    try {
      // Nếu đổi mật khẩu, kiểm tra mật khẩu hiện tại
      if (mode === 'change') {
        const checkRes = await checkTransactionPassword(formData.currentPassword);
        if (!checkRes.success) {
          if (checkRes.errorType === "Transaction_Password_Not_Set") {
            setErrors({ currentPassword: "Mật khẩu giao dịch chưa được thiết lập" });
          } else if (checkRes.errorType === "Invalid_Transaction_Password") {
            setErrors({ currentPassword: "Mật khẩu giao dịch không chính xác" });
          } else {
            setErrors({ general: checkRes.message });
          }
          setLoading(false);
          return;
        }
      }

      // Tạo / cập nhật mật khẩu mới
      const createRes = await createOrUpdateTransactionPassword(formData.newPassword);
      if (!createRes.success) {
        setErrors({ general: createRes.message });
        setLoading(false);
        return;
      }

      setSuccess(createRes.message || (mode === 'change' ? "Cập nhật mật khẩu giao dịch thành công!" : "Tạo mật khẩu giao dịch thành công!"));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrors({ general: "Có lỗi xảy ra, vui lòng thử lại." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles styles={{
        '._mainContent_b1piq_13': { marginLeft: '30px !important', marginTop: '30px!important' },
        'html, body': { backgroundColor: '#fff' }
      }} />
      <Container maxWidth="1000px" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Chọn hành động
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={mode === 'create' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setMode('create');
                    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                    setSuccess('');
                  }}
                  startIcon={<Shield size={20} />}
                >
                  Tạo mật khẩu giao dịch
                </Button>
                <Button
                  variant={mode === 'change' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setMode('change');
                    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                    setSuccess('');
                  }}
                  startIcon={<Lock size={20} />}
                >
                  Đổi mật khẩu giao dịch
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'primary.light',
                  borderRadius: 2,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Shield size={28} style={{ color: '#1976d2' }} />
              </Box>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {mode === 'change' ? 'Đổi mật khẩu giao dịch' : 'Tạo mật khẩu giao dịch'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {mode === 'change'
                    ? 'Cập nhật mật khẩu giao dịch của bạn để bảo mật tài khoản'
                    : 'Tạo mật khẩu giao dịch để bảo vệ các giao dịch quan trọng'}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock size={16} />
                  Lưu ý bảo mật
                </Box>
              </AlertTitle>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>Mật khẩu giao dịch phải khác với mật khẩu đăng nhập</li>
                <li>Sử dụng ít nhất 6 ký tự, bao gồm chữ và số</li>
                <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              </Box>
            </Alert>

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={16} />
                  {success}
                </Box>
              </Alert>
            )}
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertTriangle size={16} />
                  {errors.general}
                </Box>
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              {mode === 'change' && (
                <PasswordField
                  label="Mật khẩu giao dịch hiện tại"
                  field="currentPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                  showPasswords={showPasswords}
                  formData={formData}
                  errors={errors}
                  togglePasswordVisibility={togglePasswordVisibility}
                  handleInputChange={handleInputChange}
                />
              )}
              <PasswordField
                label="Mật khẩu giao dịch mới"
                field="newPassword"
                placeholder="Nhập mật khẩu mới"
                required
                showPasswords={showPasswords}
                formData={formData}
                errors={errors}
                togglePasswordVisibility={togglePasswordVisibility}
                handleInputChange={handleInputChange}
              />
              <PasswordField
                label="Xác nhận mật khẩu mới"
                field="confirmPassword"
                placeholder="Nhập lại mật khẩu mới"
                required
                showPasswords={showPasswords}
                formData={formData}
                errors={errors}
                togglePasswordVisibility={togglePasswordVisibility}
                handleInputChange={handleInputChange}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Shield size={20} />}
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                {loading
                  ? 'Đang xử lý...'
                  : mode === 'change'
                    ? 'Cập nhật mật khẩu'
                    : 'Tạo mật khẩu giao dịch'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default TransactionPasswordSettings;
