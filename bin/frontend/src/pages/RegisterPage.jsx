import { useState } from 'react';
import { Box, Button, Container, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { setStoredUser } from '../utils/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'PROVIDER' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/register', formData);
      const user = { ...response.data, token: response.data.token };
      setStoredUser(user);
      toast.success('Registration complete');
      if (response.data.role === 'ROLE_ADMIN') navigate('/admin');
      else if (response.data.role === 'ROLE_PROVIDER') navigate('/provider');
      else navigate('/consumer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Full Name" name="fullName" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          <TextField label="Email" name="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <TextField label="Password" name="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <TextField select label="Role" name="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <MenuItem value="PROVIDER">Provider</MenuItem>
            <MenuItem value="CONSUMER">Consumer</MenuItem>
          </TextField>
          <Button type="submit" variant="contained">Create account</Button>
          <Button component={Link} to="/login">Already have an account?</Button>
        </Box>
      </Paper>
    </Container>
  );
}
