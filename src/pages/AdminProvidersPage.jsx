import { useEffect, useState } from 'react';
import { Box, Button, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminProvidersPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getProviders();
      setProviders(response || []);
    } catch (err) {
      setError(err.message || 'Unable to load providers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProviders(); }, []);

  if (loading) return <DashboardLayout role="ADMIN" title="Providers" subtitle="Monitor provider performance."><LoadingState title="Loading providers" description="Fetching provider records." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Providers" subtitle="Monitor provider performance."><ErrorState message={error} retryLabel="Try again" onRetry={loadProviders} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Providers" subtitle="Inspect provider portfolios and platform contribution.">
      <PageHeader title="Providers" subtitle="Monitor providers, their APIs and marketplace impact." />
      <Box sx={{ display: 'grid', gap: 2 }}>
        {providers.map((provider) => (
          <Card key={provider.id} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography fontWeight={700}>{provider.name}</Typography>
                <Typography color="text.secondary">{provider.company}</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${provider.publishedApis} published APIs`} />
                <Chip label={`${provider.pendingApis} pending`} />
                <Chip label={`${provider.subscribers} subscribers`} />
                <Chip label={`Revenue ₹${provider.revenue}`} />
              </Stack>
            </Stack>
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(`/admin/providers/${provider.id}`)}>View provider</Button>
          </Card>
        ))}
      </Box>
    </DashboardLayout>
  );
};

export default AdminProvidersPage;
