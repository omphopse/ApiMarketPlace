import { useState } from 'react';
import { Box, Button, Card, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../config/appConfig';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'CONSUMER' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
      toast.success(`Welcome aboard, ${user.fullName || user.name}`);
      if (user.role === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/consumer/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="md">
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700}>{APP_NAME}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Create a real account through the Spring Boot backend as a provider or consumer.</Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Full name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
                <TextField label="Email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                <TextField label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: 1 }}>
                  <Button fullWidth variant={formData.role === 'PROVIDER' ? 'contained' : 'outlined'} onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}>Provider</Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Publish and monetize APIs.</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: 1 }}>
                  <Button fullWidth variant={formData.role === 'CONSUMER' ? 'contained' : 'outlined'} onClick={() => setFormData({ ...formData, role: 'CONSUMER' })}>Consumer</Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Discover and integrate APIs.</Typography>
                </Box>
              </Stack>
              <FormControlLabel control={<Checkbox />} label="I agree to the terms and conditions" />
              <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
            </Box>
            <Button component={Link} to="/login" variant="text">Already have an account? Sign in</Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
