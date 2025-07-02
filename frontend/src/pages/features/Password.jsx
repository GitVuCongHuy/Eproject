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
  GlobalStyles,
  Fade,
  Chip,
  Paper
} from '@mui/material';
import {
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Key,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/Context';

const PasswordField = ({ label, field, placeholder, required = true, showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }) => (
  <Box sx={{ mb: 2 }}>
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
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => togglePasswordVisibility(field)}
              edge="end"
              aria-label={`toggle ${field} password visibility`}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: 'white' }
              }}
            >
              {showPasswords[field] ? <EyeOff size={20} /> : <Eye size={20} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          '& fieldset': {
            borderColor: 'rgba(255,255,255,0.3)',
            borderWidth: 1
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.5)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(255,255,255,0.8)',
            borderWidth: 2
          },
          '& input': {
            color: 'white',
            fontSize: '1.1rem',
            letterSpacing: '0.1em'
          }
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255,255,255,0.8)',
          '&.Mui-focused': {
            color: 'white'
          }
        },
        '& .MuiFormHelperText-root': {
          color: '#ffcdd2',
          fontWeight: 500
        }
      }}
    />
  </Box>
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
      newErrors.currentPassword = 'Please enter your current transaction password';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Please enter a new transaction password';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be exactly 6 digits';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password does not match';
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
        setSuccess(createResult.message || 'Operation successful!');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw createResult;
      }
      
    } catch (error) {
      if (error.errorType === 'Invalid_Transaction_Password') {
        setErrors({ currentPassword: error.message || 'Current transaction password is incorrect' });
      } else if (error.errorType === 'Transaction_Password_Not_Set') {
        setErrors({ general: 'You do not have a password yet. Please use the "Create Password" function.' });
      } else {
        setErrors({ general: error.message || 'An error occurred, please try again.' });
      }
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles styles={{
              '._mainContent_b1piq_13': 
                {marginLeft: '0px !important', 
                marginTop: '0px !important',
                padding: '0px !important'},
              'html, body': {
                overflowY: 'hidden', 
                }, 
      }} />
      
      <Box sx={{ 
        height: '100vh',
        background: 'linear-gradient(135deg, rgb(27, 27, 27) 0%, #c53030 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Paper elevation={24} sx={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              borderRadius: '25px',
              border: '1px solid rgba(255,255,255,0.2)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 100%)'
              }
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Box sx={{ 
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.2)',
                    mb: 2,
                    animation: 'pulse 2s infinite'
                  }}>
                    <Shield size={32} style={{ color: 'white' }} />
                  </Box>
                  <Typography variant="h4" component="h1" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {mode === 'change' ? 'Change Password' : 'Create Password'}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.1rem'
                  }}>
                    {mode === 'change' ? 'Update your transaction password' : 'Protect your important transactions'}
                  </Typography>
                </Box>

                {/* Mode Selection */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, justifyContent: 'center' }}>
                  <Chip
                    icon={<Key size={16} />}
                    label="Create Password"
                    onClick={() => { 
                      setMode('create'); 
                      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
                      setErrors({}); 
                      setSuccess(''); 
                    }}
                    variant={mode === 'create' ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: mode === 'create' ? 'rgba(255,255,255,0.3)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.5)',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  />
                  <Chip
                    icon={<Lock size={16} />}
                    label="Change Password"
                    onClick={() => { 
                      setMode('change'); 
                      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); 
                      setErrors({}); 
                      setSuccess(''); 
                    }}
                    variant={mode === 'change' ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: mode === 'change' ? 'rgba(255,255,255,0.3)' : 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.5)',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  />
                </Box>

                {/* Security Notice */}
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '15px',
                    '& .MuiAlert-icon': { color: 'white' },
                    '& .MuiAlert-message': { color: 'white' }
                  }}
                >
                  <AlertTitle sx={{ color: 'white', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Sparkles size={16} />
                      Security Notice
                    </Box>
                  </AlertTitle>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    The transaction password must be 6 digits and not shared with anyone else.
                  </Typography>
                </Alert>

                {/* Success/Error Messages */}
                {success && (
                  <Fade in>
                    <Alert severity="success" sx={{ 
                      mb: 3,
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      border: '1px solid rgba(76, 175, 80, 0.5)',
                      borderRadius: '15px',
                      '& .MuiAlert-icon': { color: '#4caf50' },
                      '& .MuiAlert-message': { color: 'white' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle size={16} />
                        {success}
                      </Box>
                    </Alert>
                  </Fade>
                )}

                {errors.general && (
                  <Fade in>
                    <Alert severity="error" sx={{ 
                      mb: 3,
                      backgroundColor: 'rgba(5, 5, 5, 0.2)',
                      border: '1px solid rgba(244, 67, 54, 0.5)',
                      borderRadius: '15px',
                      '& .MuiAlert-icon': { color: '#f44336' },
                      '& .MuiAlert-message': { color: 'white' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={16} />
                        {errors.general}
                      </Box>
                    </Alert>
                  </Fade>
                )}

                {/* Form */}
                <Box component="form" noValidate onSubmit={handleSubmit}>
                  {mode === 'change' && (
                    <PasswordField
                      label="Current Password"
                      field="currentPassword"
                      placeholder="Enter current password"
                      {...{ showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }}
                    />
                  )}
                  
                  <PasswordField
                    label="New Password (6 digits)"
                    field="newPassword"
                    placeholder="Enter new password"
                    {...{ showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }}
                  />
                  
                  <PasswordField
                    label="Confirm Password"
                    field="confirmPassword"
                    placeholder="Re-enter new password"
                    {...{ showPasswords, formData, errors, handleInputChange, togglePasswordVisibility }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress color="inherit" size={20} /> : <Shield size={20} />}
                    sx={{ 
                      mt: 2,
                      py: 1.8,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: '15px',
                      background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      color: 'white',
                      textTransform: 'none',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                      },
                      '&:disabled': {
                        background: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.5)'
                      }
                    }}
                  >
                    {loading ? 'Processing...' : (mode === 'change' ? 'Update Password' : 'Create Password')}
                  </Button>
                </Box>
              </CardContent>
            </Paper>
          </Fade>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
};

export default TransactionPasswordSettings;