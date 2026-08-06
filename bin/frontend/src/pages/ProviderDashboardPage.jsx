import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { clearStoredUser, getStoredUser } from '../utils/auth';

export default function ProviderDashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };

  return (
    <Container sx={{ py: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Provider Dashboard</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout</Button>
      </Box>
      <Typography color="text.secondary" sx={{ mt: 2 }}>Welcome, {user?.fullName || 'Provider'}.</Typography>
    </Container>
  );
}
