import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import StatCard from '../components/StatCard';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { consumerService } from '../services/consumerService';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/formatters';

const statusColors = {
  Successful: '#10B981',
  Failed: '#EF4444',
  'Rate limited': '#F59E0B'
};

const ConsumerDashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [apiKeys, setApiKeys] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [profileError, setProfileError] = useState(false);
  const [keysError, setKeysError] = useState(false);

  useEffect(() => {
    consumerService.getDashboard()
      .then(setDashboard)
      .catch((err) => setDashboardError(err.message || 'Unable to load consumer dashboard.'));

    consumerService.getProfile()
      .then(setProfile)
      .catch(() => setProfileError(true));

    consumerService.getApiKeys()
      .then(setApiKeys)
      .catch(() => setKeysError(true));
  }, []);

  const recentUsage = dashboard?.recentUsage || [];
  const recentSubscriptions = dashboard?.recentSubscriptions || [];

  const usageTrendData = useMemo(() => {
    const counts = new Map();
    recentUsage.forEach((log) => {
      const label = log.timestamp ? formatDate(log.timestamp) : 'Unknown';
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value }))
      .sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [recentUsage]);

  const apiUsageBreakdown = useMemo(() => {
    const counts = new Map();
    recentUsage.forEach((log) => {
      const key = log.endpoint || 'Unknown endpoint';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [recentUsage]);

  const statusBreakdown = useMemo(() => {
    let successful = 0;
    let failed = 0;
    let rateLimited = 0;

    recentUsage.forEach((log) => {
      if (log.statusCode === 429) {
        rateLimited += 1;
      } else if (log.statusCode >= 200 && log.statusCode < 300) {
        successful += 1;
      } else {
        failed += 1;
      }
    });

    return [
      { name: 'Successful', value: successful, color: statusColors.Successful },
      { name: 'Failed', value: failed, color: statusColors.Failed },
      { name: 'Rate limited', value: rateLimited, color: statusColors['Rate limited'] }
    ].filter((item) => item.value > 0);
  }, [recentUsage]);

  if (dashboardError) {
    return (
      <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Track your API subscriptions and usage.">
        <ErrorState message={dashboardError} />
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Track your API subscriptions and usage.">
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary"><Skeleton width="60%" /></Typography>
                  <Typography variant="h4" sx={{ mt: 1 }}><Skeleton width="40%" /></Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ height: 360, borderRadius: 3, p: 3 }}>
                <Typography variant="h6" color="text.secondary"><Skeleton width="30%" /></Typography>
                <Box sx={{ mt: 4 }}><Skeleton variant="rectangular" width="100%" height={240} /></Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}><Card variant="outlined" sx={{ height: 170, borderRadius: 3, p: 3 }}><Skeleton width="40%" /><Box sx={{ mt: 3 }}><Skeleton width="100%" height={16} /><Skeleton width="80%" height={16} sx={{ mt: 1 }} /></Box></Card></Grid>
                <Grid item xs={12}><Card variant="outlined" sx={{ height: 170, borderRadius: 3, p: 3 }}><Skeleton width="40%" /><Box sx={{ mt: 3 }}><Skeleton width="100%" height={16} /><Skeleton width="80%" height={16} sx={{ mt: 1 }} /></Box></Card></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    );
  }

  const welcomeName = profile?.fullName || 'Welcome back';
  const showUsageChart = usageTrendData.length > 0;
  const showApiBreakdown = apiUsageBreakdown.length > 0;
  const showStatusChart = statusBreakdown.length > 0;

  return (
    <DashboardLayout role="CONSUMER" title="Consumer dashboard" subtitle="Track your API subscriptions and usage.">
      <PageHeader
        title={profile?.fullName ? `Welcome back, ${profile.fullName}` : 'Welcome back'}
        subtitle="Your API subscriptions and usage at a glance."
        action={(
          <Button component={Link} to="/marketplace" variant="contained">
            Explore APIs
          </Button>
        )}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Active subscriptions', value: dashboard.activeSubscriptions },
          { label: 'Total subscriptions', value: dashboard.totalSubscriptions }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={6} key={item.label}>
            <StatCard label={item.label} value={item.value ?? 'Unavailable'} accent="primary" />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AppCard title="Recent subscriptions" subtitle="Your most recent subscription activity.">
            {recentSubscriptions.length ? (
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>API</TableCell>
                        <TableCell>Plan</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Since</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentSubscriptions.map((subscription) => (
                        <TableRow key={subscription.subscriptionId} hover>
                          <TableCell>{subscription.api?.name || 'API unavailable'}</TableCell>
                          <TableCell>{subscription.plan?.name || 'Plan unavailable'}</TableCell>
                          <TableCell>
                            <Chip label={subscription.status || 'Unknown'} size="small" />
                          </TableCell>
                          <TableCell>{subscription.createdAt ? formatDate(subscription.createdAt) : 'Unavailable'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">No recent subscriptions.</Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Button component={Link} to="/consumer/subscriptions" variant="outlined">View all subscriptions</Button>
            </Box>
          </AppCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <AppCard title="Recent API activity" subtitle="Latest requests from your consumer account.">
            {recentUsage.length ? (
              <Box sx={{ overflowX: 'auto' }}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Method</TableCell>
                        <TableCell>Endpoint</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>When</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentUsage.slice(0, 7).map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>{log.httpMethod || 'N/A'}</TableCell>
                          <TableCell>{log.endpoint || 'Unavailable'}</TableCell>
                          <TableCell>{log.statusCode ?? 'N/A'}</TableCell>
                          <TableCell>{log.timestamp ? formatRelativeTime(log.timestamp) : 'Unavailable'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">No recent API activity.</Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Button component={Link} to="/consumer/usage" variant="outlined">View usage details</Button>
            </Box>
          </AppCard>
        </Grid>
      </Grid>

      <AppCard title="Quick actions" subtitle="Navigate to the most important consumer workflows.">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={Link} to="/marketplace" variant="contained">Explore APIs</Button>
          <Button component={Link} to="/consumer/subscriptions" variant="outlined">My subscriptions</Button>
          <Button component={Link} to="/consumer/api-keys" variant="outlined">API keys</Button>
          <Button component={Link} to="/consumer/usage" variant="outlined">Usage</Button>
        </Stack>
      </AppCard>
    </DashboardLayout>
  );
};

export default ConsumerDashboardPage;
