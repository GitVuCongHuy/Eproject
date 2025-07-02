import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper
} from '@mui/material';
import axios from 'axios';
import { useAdmin } from '../../contexts/AdminContext'; // Đường dẫn có thể khác
import { useNavigate } from 'react-router-dom';

function Admin_login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5028/backend/Admin_Customer/login', {
        username,
        password
      });

      login(res.data); // Lưu vào context
      navigate('/admin_new/admin_main'); // Chuyển đến trang admin chính
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" mb={2} align="center">Đăng nhập Admin</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên đăng nhập"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Đăng nhập
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default Admin_login;
