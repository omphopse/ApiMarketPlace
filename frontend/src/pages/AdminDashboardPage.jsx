import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [apis, setApis] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminService.getDashboard(), adminService.getAnalytics(), adminService.getApis()])
      .then(([dashboardResponse, analyticsResponse, apisResponse]) => {
        setDashboard(dashboardResponse);
        setAnalytics(analyticsResponse);
        setApis(apisResponse.content || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const roleDistribution = useMemo(() => {
    if (!analytics) return [];
    const adminCount = Math.max(analytics.totalUsers - analytics.totalProviders - analytics.totalConsumers, 0);
    return [
      { name: 'Providers', value: analytics.totalProviders, color: '#2563EB' },
      { name: 'Consumers', value: analytics.totalConsumers, color: '#10B981' },
      { name: 'Admins', value: adminCount, color: '#F59E0B' }
    ];
  }, [analytics]);

  const providerStatusData = useMemo(() => {
    const totals = { approved: 0, pending: 0, rejected: 0 };
    apis.forEach((api) => {
      if (api.status === 'APPROVED') totals.approved += 1;
      if (api.status === 'PENDING') totals.pending += 1;
      if (api.status === 'REJECTED') totals.rejected += 1;
    });
    return [
      { name: 'Approved', value: totals.approved },
      { name: 'Pending', value: totals.pending },
      { name: 'Rejected', value: totals.rejected }
    ];
  }, [apis]);

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor live platform totals.">
        <ErrorState message={error} />
      </DashboardLayout>
    );
  }

  if (!dashboard || !analytics) {
    return (
      <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor live platform totals.">
        <LoadingState title="Loading admin dashboard" description="Fetching the latest admin metrics." />
      </DashboardLayout>
    );
  }

  const stats = [
    { label: 'Total users', value: dashboard.totalUsers },
    { label: 'Providers', value: dashboard.totalProviders },
    { label: 'Consumers', value: dashboard.totalConsumers },
    { label: 'APIs', value: dashboard.totalApis },
    { label: 'Subscriptions', value: dashboard.totalSubscriptions },
    { label: 'Revenue', value: dashboard.totalRevenue !== undefined && dashboard.totalRevenue !== null ? `₹${dashboard.totalRevenue.toLocaleString()}` : 'Unavailable' }
  ];

  return (
    <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor live platform totals.">
      <PageHeader
        title="Platform overview"
        subtitle="All metrics come from the Spring Boot admin API."
        action={(
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/admin/api-approvals" variant="contained">
              Review approvals
            </Button>
            <Button component={Link} to="/admin/users" variant="outlined">
              Manage users
            </Button>
          </Stack>
        )}
      />

      <Grid container spacing={2}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.label}>
            <StatCard label={item.label} value={item.value ?? 'Unavailable'} accent="primary" />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <AppCard title="User role distribution" subtitle="How the platform user base is composed.">
            <Box sx={{ height: 320 }}>
              {roleDistribution.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                      {roleDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No role distribution data available.</Typography>
              )}
            </Box>
          </AppCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <AppCard title="Provider approval status" subtitle="Pending provider applications from the backend.">
            <Box sx={{ height: 320 }}>
              {providerStatusData.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={providerStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary">No provider approval metrics available.</Typography>
              )}
            </Box>
          </AppCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <AppCard title="Pending providers" subtitle="Providers currently waiting for review.">
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
              {analytics.pendingProviders}
            </Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Total categories" subtitle="Categories currently available in the marketplace.">
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
              {analytics.totalCategories}
            </Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Active users" subtitle="All users currently registered on the platform.">
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
              {dashboard.totalUsers}
            </Typography>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;
