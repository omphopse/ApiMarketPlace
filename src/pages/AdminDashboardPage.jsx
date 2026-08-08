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
import { adminStats, pendingApprovals } from '../mocks/adminMockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';

const growthData = [
  { name: 'Jan', value: 32 }, { name: 'Feb', value: 41 }, { name: 'Mar', value: 48 }, { name: 'Apr', value: 54 }, { name: 'May', value: 61 }, { name: 'Jun', value: 72 }
];

const distributionData = [
  { name: 'Providers', value: 24 }, { name: 'Consumers', value: 76 }
];

const colors = ['#1677FF', '#0D3B66'];
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard');
        if (active) {
          setDashboard(response.data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load the admin dashboard.');
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
    return <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor marketplace health and platform operations."><LoadingState title="Loading admin dashboard" description="Checking the backend dashboard endpoint." /></DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor marketplace health and platform operations."><ErrorState message={error} retryLabel="Try again" onRetry={() => window.location.reload()} /></DashboardLayout>;
  }

  if (!isMockMode) {
    return (
      <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor marketplace health and platform operations.">
        <PageHeader title="Welcome back, Admin" subtitle={dashboard?.message || 'Role-based dashboard access is live.'} action={<Button component={Link} to="/dev/routes" variant="outlined">Open route inventory</Button>} />
        <AppCard title="Backend status" subtitle="The current Spring Boot backend exposes the protected admin dashboard endpoint only.">
          <Typography color="text.secondary">Detailed admin metrics, approvals, user management, and reporting are not implemented by the backend yet, so the UI now shows the real backend capability instead of mock business data.</Typography>
        </AppCard>
      </DashboardLayout>
    );
  }

  return (
  <DashboardLayout role="ADMIN" title="Admin dashboard" subtitle="Monitor marketplace health and platform operations.">
    <PageHeader title="Welcome back, Admin" subtitle={dashboard?.message || 'Here is the health of the marketplace this week.'} action={<Button component={Link} to="/dev/routes" variant="outlined">Open route inventory</Button>} />
    <Grid container spacing={3}>
      {adminStats.map((stat) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={stat.label}>
          <StatCard label={stat.label} value={stat.value} change={stat.change} accent="primary" />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} lg={8}>
        <AppCard title="Marketplace growth" subtitle="New signups and API activity by month">
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke="#1677FF" fill="#1677FF" fillOpacity={0.15} /></AreaChart>
            </ResponsiveContainer>
          </Box>
        </AppCard>
      </Grid>
      <Grid item xs={12} lg={4}>
        <AppCard title="User distribution" subtitle="Providers vs consumers">
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={distributionData} innerRadius={70} outerRadius={90} dataKey="value">{distributionData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </Box>
        </AppCard>
      </Grid>
    </Grid>
    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={7}>
        <AppCard title="Pending API approvals" subtitle="Review new submissions before publishing">
          <Stack spacing={2}>
            {pendingApprovals.map((item) => (
              <Box key={item.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography fontWeight={700}>{item.api}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.provider} • {item.category}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip label={item.status} />
                  <Button size="small" component={Link} to="/admin/api-approvals">Review</Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </AppCard>
      </Grid>
      <Grid item xs={12} md={5}>
        <AppCard title="Platform activity" subtitle="Snapshot of operations">
          <Stack spacing={2}>
            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'secondary.main' }}>
              <Typography variant="caption" color="text.secondary">Automated checks</Typography>
              <Typography variant="h5" fontWeight={700}>94% passed</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Alerts</Typography>
              <Typography fontWeight={700}>3 high-priority issues</Typography>
            </Box>
            <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">Quick actions</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                <Chip label="Open approvals" component={Link} to="/admin/api-approvals" clickable />
                <Chip label="Users" component={Link} to="/admin/users" clickable />
                <Chip label="Reports" component={Link} to="/admin/reports" clickable />
              </Stack>
            </Box>
          </Stack>
        </AppCard>
      </Grid>
    </Grid>
  </DashboardLayout>
  );
};

export default AdminDashboardPage;
