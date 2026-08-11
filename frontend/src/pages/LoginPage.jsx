import { useState } from 'react';
import { Box, Button, Card, Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../config/appConfig';

const authFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: 'rgba(255,255,255,0.05)',
    transition: 'background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.12)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(168,85,247,0.35)'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#a855f7',
      boxShadow: '0 0 0 4px rgba(168,85,247,0.12)'
    },
    '&.Mui-focused': {
      bgcolor: 'rgba(255,255,255,0.08)'
    }
  }
};

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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#05070f',
        color: 'common.white',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 10% 8%, rgba(168,85,247,0.24), transparent 20%), radial-gradient(circle at 92% 18%, rgba(59,130,246,0.16), transparent 18%)',
          opacity: 1,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundSize: '96px 96px',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          opacity: 0.08,
          pointerEvents: 'none'
        }}
      />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 520,
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.12)',
            bgcolor: 'rgba(10,14,28,0.95)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 40px 120px rgba(8,12,24,0.6)',
            animation: 'fadeInUp 0.65s ease-out',
            '@keyframes fadeInUp': {
              '0%': { opacity: 0, transform: 'translateY(15px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            }
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography variant="overline" color="secondary.main" fontWeight={700} sx={{ letterSpacing: '0.28em' }}>
                {APP_NAME}
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                Sign in to continue your APIHub workflow with secure developer access.
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
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
                sx={authFieldStyles}
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
                      <Lock sx={{ color: 'text.secondary' }} />
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
                sx={authFieldStyles}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{
                  py: 1.8,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)',
                  boxShadow: '0 18px 45px rgba(124,58,237,0.24)',
                  transition: 'transform 0.25s ease, boxShadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 22px 55px rgba(124,58,237,0.34)'
                  },
                  '&:active': {
                    transform: 'translateY(0px)'
                  }
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary">Don’t have an account?</Typography>
              <Button component={Link} to="/register" variant="text" sx={{ color: 'secondary.light' }}>
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
