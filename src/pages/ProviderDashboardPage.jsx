import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import StatCard from '../components/StatCard';
import StatusChip from '../components/StatusChip';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import apiClient from '../services/apiClient';
import { providerStats, recentApis, revenueSeries, usageSeries } from '../mocks/providerMockData';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts';

const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

const ProviderDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const response = await apiClient.get('/provider/dashboard');
        if (active) {
          setDashboard(response.data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load the provider dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <DashboardLayout role="PROVIDER" title="Provider dashboard" subtitle="Manage APIs, performance and subscriber growth."><LoadingState title="Loading provider dashboard" description="Checking the backend dashboard endpoint." /></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout role="PROVIDER" title="Provider dashboard" subtitle="Manage APIs, performance and subscriber growth."><ErrorState message={error} retryLabel="Try again" onRetry={() => window.location.reload()} /></DashboardLayout>;
  }

  if (!isMockMode) {
    return (
      <DashboardLayout role="PROVIDER" title="Provider dashboard" subtitle="Manage APIs, performance and subscriber growth.">
        <PageHeader title="Welcome back, Provider" subtitle={dashboard?.message || 'Role-based dashboard access is live.'} action={<Button component={Link} to="/provider/apis/create" variant="contained">Create API</Button>} />
        <AppCard title="Backend status" subtitle="The current Spring Boot backend does not expose provider API CRUD or analytics endpoints yet.">
          <Typography color="text.secondary">Provider API creation, plan management, documentation, submission, and revenue analytics remain backend-gapped and are shown as unavailable rather than simulated.</Typography>
        </AppCard>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout role="PROVIDER" title="Provider dashboard" subtitle="Manage APIs, performance and subscriber growth.">
    <PageHeader title="Welcome back, Provider" subtitle={dashboard?.message || 'Manage your APIs, subscribers and performance.'} action={<Button component={Link} to="/provider/apis/create" variant="contained">Create API</Button>} />
    <Grid container spacing={3}>
      {providerStats.map((stat) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={stat.label}>
          <StatCard label={stat.label} value={stat.value} change={stat.change} accent="primary" />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} lg={8}>
        <AppCard title="Revenue overview" subtitle="Revenue trend across the last six months">
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke="#1677FF" fill="#1677FF" fillOpacity={0.15} /></AreaChart>
            </ResponsiveContainer>
          </Box>
        </AppCard>
      </Grid>
      <Grid item xs={12} lg={4}>
        <AppCard title="API status" subtitle="Current publication health">
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Published</Typography><Typography variant="h5" fontWeight={700}>18</Typography></Box>
            <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Pending</Typography><Typography variant="h5" fontWeight={700}>4</Typography></Box>
            <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Rejected</Typography><Typography variant="h5" fontWeight={700}>1</Typography></Box>
          </Stack>
        </AppCard>
      </Grid>
    </Grid>
    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={7}>
        <AppCard title="Recent APIs" subtitle="Latest product and publishing activity">
          <Stack spacing={2}>
            {recentApis.map((api) => (
              <Box key={api.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography fontWeight={700}>{api.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{api.category} • {api.requests} requests</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip label={api.status} />
                  <Button size="small" component={Link} to="/provider/apis">View</Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </AppCard>
      </Grid>
      <Grid item xs={12} md={5}>
        <AppCard title="Usage overview" subtitle="Request volume over the last week">
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageSeries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#1677FF" radius={[8, 8, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </Box>
        </AppCard>
      </Grid>
    </Grid>
  </DashboardLayout>
  );
};

export default ProviderDashboardPage;
