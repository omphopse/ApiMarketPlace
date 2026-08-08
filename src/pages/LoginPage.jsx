import { useState } from 'react';
import { Box, Button, Card, Checkbox, Container, FormControlLabel, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../config/appConfig';

const demoAccounts = [
  { role: 'Admin', email: 'admin@marketplace.com', password: 'Admin@123' }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.fullName || user.name}`);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/consumer/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (account) => {
    setFormData({ email: account.email, password: account.password });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="lg">
        <Card sx={{ overflow: 'hidden', borderRadius: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' } }}>
            <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: 'secondary.main' }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.18em' }}>Phase 5 • Spring Boot</Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>{APP_NAME}</Typography>
              <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 520 }}>A real authentication flow connected to the Spring Boot backend with role-based dashboard access.</Typography>
              <Box sx={{ mt: 3, p: 3, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={700}>Backend demo account</Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>Use the seeded admin account when the backend is running, or create a provider or consumer account through the registration flow.</Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {demoAccounts.map((account) => (
                    <Button key={account.role} variant="outlined" onClick={() => fillDemoAccount(account)} sx={{ justifyContent: 'flex-start' }}>
                      {account.role} demo
                    </Button>
                  ))}
                </Stack>
              </Box>
            </Box>
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h4" fontWeight={700}>Welcome back</Typography>
                  <Typography color="text.secondary">Sign in to continue to your workspace.</Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                  <TextField label="Email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><Email /></InputAdornment> }} />
                  <TextField label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel control={<Checkbox />} label="Remember me" />
                    <Button component={Link} to="/forgot-password">Forgot password</Button>
                  </Stack>
                  <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
                  <Button component={Link} to="/register" variant="text">Create account</Button>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
