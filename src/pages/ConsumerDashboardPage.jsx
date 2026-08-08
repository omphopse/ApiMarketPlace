import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import apiClient from '../services/apiClient';
import { consumerStats, subscriptions, usageSeriesConsumer } from '../mocks/consumerMockData';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

const ConsumerDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const response = await apiClient.get('/consumer/dashboard');
        if (active) {
          setDashboard(response.data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load the consumer dashboard.');
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
    return <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Monitor your API subscriptions and usage."><LoadingState title="Loading consumer dashboard" description="Checking the backend dashboard endpoint." /></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Monitor your API subscriptions and usage."><ErrorState message={error} retryLabel="Try again" onRetry={() => window.location.reload()} /></DashboardLayout>;
  }

  if (!isMockMode) {
    return (
      <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Monitor your API subscriptions and usage.">
        <PageHeader title="Welcome back, Developer" subtitle={dashboard?.message || 'Role-based dashboard access is live.'} action={<Button component={Link} to="/marketplace" variant="contained">Explore APIs</Button>} />
        <AppCard title="Backend status" subtitle="The current Spring Boot backend exposes only the protected consumer dashboard endpoint.">
          <Typography color="text.secondary">Marketplace browsing, subscriptions, API keys, usage, billing, and profile actions remain backend-gapped and are not presented as real data in this mode.</Typography>
        </AppCard>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Monitor your API subscriptions and usage.">
    <PageHeader title="Welcome back, Developer" subtitle={dashboard?.message || 'Manage your API subscriptions and usage.'} action={<Button component={Link} to="/marketplace" variant="contained">Explore APIs</Button>} />
    <Grid container spacing={3}>
      {consumerStats.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.label}>
          <StatCard label={stat.label} value={stat.value} change={stat.change} accent="primary" />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} lg={8}>
        <AppCard title="API usage overview" subtitle="Requests over the last six months">
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageSeriesConsumer}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke="#1677FF" fill="#1677FF" fillOpacity={0.15} /></AreaChart>
            </ResponsiveContainer>
          </Box>
        </AppCard>
      </Grid>
      <Grid item xs={12} lg={4}>
        <AppCard title="Usage limits" subtitle="Current plan consumption">
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">Requests used</Typography>
              <Typography variant="h4" fontWeight={700}>72K</Typography>
              <LinearProgress variant="determinate" value={72} sx={{ mt: 1, height: 10, borderRadius: 999 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Remaining</Typography>
              <Typography variant="h5" fontWeight={700}>28K</Typography>
            </Box>
          </Stack>
        </AppCard>
      </Grid>
    </Grid>
    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={7}>
        <AppCard title="Current subscriptions" subtitle="Your active API access and usage">
          <Stack spacing={2}>
            {subscriptions.map((subscription) => (
              <Box key={subscription.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography fontWeight={700}>{subscription.name}</Typography>
                    <Typography variant="body2" color="text.secondary">Plan {subscription.plan} • Renewal {subscription.renewal}</Typography>
                  </Box>
                  <Chip label={subscription.status} color={subscription.status === 'Active' ? 'success' : 'warning'} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{subscription.requestLimit}</Typography>
                <LinearProgress variant="determinate" value={Number(subscription.usage.replace('%', ''))} sx={{ mt: 1, height: 10, borderRadius: 999 }} />
              </Box>
            ))}
          </Stack>
        </AppCard>
      </Grid>
      <Grid item xs={12} md={5}>
        <AppCard title="Quick actions" subtitle="Jump into your core workflows">
          <Stack spacing={1.5}>
            <Button component={Link} to="/marketplace" variant="contained">Explore APIs</Button>
            <Button component={Link} to="/consumer/api-keys" variant="outlined">View API keys</Button>
            <Button component={Link} to="/consumer/subscriptions" variant="outlined">My subscriptions</Button>
          </Stack>
        </AppCard>
      </Grid>
    </Grid>
  </DashboardLayout>
  );
};

export default ConsumerDashboardPage;
