import { useState } from 'react';
import { Box, Button, Card, Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
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
      <Container maxWidth="sm">
        <Card sx={{ p: { xs: 4, sm: 5 }, borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: '0.2em' }}>
                {APP_NAME}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
                Create your account
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Join APIHub and start discovering or publishing APIs.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Full name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                required
                autoComplete="name"
              />
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
                autoComplete="new-password"
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
              <TextField
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                required
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box
                  onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: formData.role === 'PROVIDER' ? 'primary.main' : 'divider',
                    bgcolor: formData.role === 'PROVIDER' ? 'primary.lighter' : 'background.paper',
                    cursor: 'pointer'
                  }}
                >
                  <Typography fontWeight={700}>Provider</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                    Publish APIs
                  </Typography>
                </Box>
                <Box
                  onClick={() => setFormData({ ...formData, role: 'CONSUMER' })}
                  sx={{
                    flex: 1,
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: formData.role === 'CONSUMER' ? 'primary.main' : 'divider',
                    bgcolor: formData.role === 'CONSUMER' ? 'primary.lighter' : 'background.paper',
                    cursor: 'pointer'
                  }}
                >
                  <Typography fontWeight={700}>Consumer</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                    Use APIs
                  </Typography>
                </Box>
              </Stack>

              <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Already have an account?</Typography>
              <Button component={Link} to="/login" variant="text">
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
