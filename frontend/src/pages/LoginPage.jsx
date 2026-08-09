import { useState } from 'react';
import { Box, Button, Card, Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../config/appConfig';

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="xs">
        <Card sx={{ p: { xs: 4, sm: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: '0.2em' }}>
                {APP_NAME}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sign in to continue to APIHub.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Don't have an account?</Typography>
              <Button component={Link} to="/register" variant="text">
                Create account
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
