import { Container, Typography } from '@mui/material';

export default function NotFoundPage() {
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4">404</Typography>
      <Typography color="text.secondary">The page you are looking for does not exist.</Typography>
    </Container>
  );
}
