import { useState } from 'react';
import { Box, Button, Container, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { setStoredUser } from '../utils/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      const user = { ...response.data, token: response.data.token };
      setStoredUser(user);
      toast.success('Welcome back!');
      if (response.data.role === 'ROLE_ADMIN') navigate('/admin');
      else if (response.data.role === 'ROLE_PROVIDER') navigate('/provider');
      else navigate('/consumer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Email" name="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField label="Password" name="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <Button type="submit" variant="contained">Login</Button>
          <Button component={Link} to="/register">Create an account</Button>
        </Box>
      </Paper>
    </Container>
  );
}
