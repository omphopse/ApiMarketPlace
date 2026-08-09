import { Button, Card, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ p: 4 }}>
        <Stack spacing={2.5}>
          <Typography variant="h4" fontWeight={700}>Access denied</Typography>
          <Typography color="text.secondary">You do not have permission to access this page with your current role.</Typography>
          <Button component={Link} to={user ? `/${user.role.toLowerCase()}/dashboard` : '/'} variant="contained">
            Return to dashboard
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export default UnauthorizedPage;
