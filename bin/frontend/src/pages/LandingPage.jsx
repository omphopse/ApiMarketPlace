import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box textAlign="center">
        <Typography variant="h3" gutterBottom>API Marketplace</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover, publish, and consume APIs through a modern marketplace experience.
        </Typography>
        <Button component={Link} to="/register" variant="contained" sx={{ mr: 2 }}>Register</Button>
        <Button component={Link} to="/login" variant="outlined">Login</Button>
      </Box>
    </Container>
  );
}
