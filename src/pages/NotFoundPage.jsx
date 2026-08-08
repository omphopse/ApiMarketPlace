import { Button, Card, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ py: 8 }}>
    <Card sx={{ p: 4 }}>
      <Stack spacing={2.5}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.16em' }}>404</Typography>
        <Typography variant="h4" fontWeight={700}>We could not find that page.</Typography>
        <Typography color="text.secondary">The route you requested is not part of the Phase 1 experience yet.</Typography>
        <Button component={Link} to="/" variant="contained">Go home</Button>
      </Stack>
    </Card>
  </Container>
);

export default NotFoundPage;
