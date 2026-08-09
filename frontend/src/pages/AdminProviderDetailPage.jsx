import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminProviderDetailPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProvider = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getProviderById(providerId);
      setProvider(result);
    } catch (err) {
      setError(err.message || 'Unable to load provider.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProvider(); }, [providerId]);

  if (loading) return <DashboardLayout role="ADMIN" title="Provider details" subtitle="Inspect provider performance."><LoadingState title="Loading provider" description="Fetching provider details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Provider details" subtitle="Inspect provider performance."><ErrorState message={error} retryLabel="Try again" onRetry={loadProvider} /></DashboardLayout>;
  if (!provider) return <DashboardLayout role="ADMIN" title="Provider details" subtitle="Inspect provider performance."><Alert severity="warning">The requested provider could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Provider details" subtitle="Understand a provider's presence on the platform.">
      <PageHeader title={provider.fullName} subtitle={provider.email} action={<Button variant="outlined" onClick={() => navigate('/admin/providers')}>Back</Button>} />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label={provider.status || 'UNKNOWN'} color={provider.status === 'ACTIVE' ? 'success' : 'default'} />
        <Chip label={`Role: ${provider.role || 'PROVIDER'}`} variant="outlined" />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Profile" subtitle="Provider overview">
            <Typography><strong>Name:</strong> {provider.fullName}</Typography>
            <Typography><strong>Email:</strong> {provider.email}</Typography>
            <Typography><strong>Role:</strong> {provider.role || 'PROVIDER'}</Typography>
            <Typography><strong>Status:</strong> {provider.status || 'UNKNOWN'}</Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Actions" subtitle="Administrative oversight">
            <Button fullWidth variant="contained" onClick={() => navigate('/admin/apis')}>View APIs</Button>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminProviderDetailPage;
