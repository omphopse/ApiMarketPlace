import { Box, Button, Card, Container, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const publicRoutes = [
  { label: 'Home', path: '/' },
  { label: 'Login', path: '/login' },
  { label: 'Register', path: '/register' },
  { label: 'Forgot Password', path: '/forgot-password' },
  { label: 'Unauthorized', path: '/unauthorized' }
];

const adminRoutes = [
  { label: 'Admin Dashboard', path: '/admin/dashboard' },
  { label: 'API Approvals', path: '/admin/api-approvals' },
  { label: 'APIs', path: '/admin/apis' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Providers', path: '/admin/providers' },
  { label: 'Consumers', path: '/admin/consumers' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Activity', path: '/admin/activity' },
  { label: 'Settings', path: '/admin/settings' }
];

const providerRoutes = [
  { label: 'Provider Dashboard', path: '/provider/dashboard' },
  { label: 'My APIs', path: '/provider/apis' },
  { label: 'Create API', path: '/provider/apis/create' },
  { label: 'Analytics', path: '/provider/analytics' }
];

const consumerRoutes = [
  { label: 'Consumer Dashboard', path: '/consumer/dashboard' },
  { label: 'Marketplace', path: '/marketplace' },
  { label: 'Subscriptions', path: '/consumer/subscriptions' },
  { label: 'Billing', path: '/consumer/billing' }
];

const RouteSection = ({ title, routes }) => (
  <Card sx={{ p: 3 }}>
    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{title}</Typography>
    <Stack spacing={1}>
      {routes.map((route) => (
        <Button key={route.path} component={Link} to={route.path} variant="outlined" sx={{ justifyContent: 'flex-start' }}>
          {route.label}
        </Button>
      ))}
    </Stack>
  </Card>
);

const DevRoutesPage = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
    <Container maxWidth="xl">
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Route inventory</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}><RouteSection title="Public" routes={publicRoutes} /></Grid>
        <Grid item xs={12} md={6} lg={3}><RouteSection title="Admin" routes={adminRoutes} /></Grid>
        <Grid item xs={12} md={6} lg={3}><RouteSection title="Provider" routes={providerRoutes} /></Grid>
        <Grid item xs={12} md={6} lg={3}><RouteSection title="Consumer" routes={consumerRoutes} /></Grid>
      </Grid>
    </Container>
  </Box>
);

export default DevRoutesPage;
