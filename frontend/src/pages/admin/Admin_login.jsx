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
import { useNavigate } from 'react-router-dom';

function Admin_login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if credentials match
      if (username === 'admin' && password === 'admin') {
        // Successful login
        console.log('Login successful');
        
        // Optional: Store login status in localStorage
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        
        // Navigate to admin main page
        navigate('/admin_new/admin_main');
      } else {
        // Invalid credentials
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
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
        <Typography variant="h5" mb={2} align="center" color="primary">
          Admin Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
            autoComplete="username"
            disabled={loading}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            autoComplete="current-password"
            disabled={loading}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Demo Credentials:
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Username: admin | Password: admin
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Admin_login;