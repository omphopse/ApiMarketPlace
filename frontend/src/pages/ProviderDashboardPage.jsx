import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Chip, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { providerService } from '../services/providerService';
import { useAuth } from '../contexts/AuthContext';

const ProviderDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    providerService.getDashboard().then(setDashboard).catch((err) => setError(err.message));
  }, []);

  if (error) return <DashboardLayout role="PROVIDER" title="Provider dashboard"><ErrorState message={error} /></DashboardLayout>;
  if (!dashboard) return <DashboardLayout role="PROVIDER" title="Provider dashboard"><LoadingState title="Loading provider dashboard" /></DashboardLayout>;

  const metricCards = [
    { label: 'Total APIs', value: dashboard.totalApis },
    { label: 'Approved', value: dashboard.approvedApis },
    { label: 'Pending', value: dashboard.pendingApis },
    { label: 'Rejected', value: dashboard.rejectedApis },
    { label: 'Archived', value: dashboard.archivedApis },
    { label: 'Subscribers', value: dashboard.totalSubscribers }
  ].filter((m) => m.value != null);

  const statusCounts = {
    Approved: dashboard.approvedApis || 0,
    Pending: dashboard.pendingApis || 0,
    Rejected: dashboard.rejectedApis || 0,
    Archived: dashboard.archivedApis || 0
  };

  const statusTotal = Object.values(statusCounts).reduce((s, v) => s + v, 0);

  const statusEntries = Object.entries(statusCounts).filter(([, v]) => v > 0 || statusTotal > 0);

  const hasSubscribersPerApi = (dashboard.recentApis || []).some((a) => a.subscribers != null);
  const hasLastUpdated = (dashboard.recentApis || []).some((a) => a.lastUpdated != null);

  const formatCurrency = (n) => {
    if (n == null) return 'Unavailable';
    try { return `₹${Number(n).toLocaleString()}`; } catch { return String(n); }
  };

  return <DashboardLayout role="PROVIDER" title="Provider dashboard">
    <PageHeader
      title={`Welcome back, ${user?.fullName || user?.name || 'Provider'}`}
      subtitle="Manage your APIs, publishing status, and marketplace activity."
      action={<Button component={Link} to="/provider/apis/create" variant="contained">+ Create API</Button>}
    />

    <Grid container spacing={2} sx={{ mb: 1 }}>
      {metricCards.map((m) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={m.label}>
          <StatCard label={m.label} value={m.value ?? 'Unavailable'} />
        </Grid>
      ))}
      {dashboard.monthlyRevenue != null && (
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard label="Revenue" value={formatCurrency(dashboard.monthlyRevenue)} />
        </Grid>
      )}
    </Grid>

    <Grid container spacing={3} sx={{ mt: 0.5 }}>
      <Grid item xs={12} md={7}>
        <AppCard title="API Status & Recent APIs" subtitle="Overview of your APIs and recent activity">
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>API Status</Typography>
              {statusTotal === 0 ? (
                <Typography color="text.secondary">No API status data available.</Typography>
              ) : (
                <Stack spacing={1}>
                  {statusEntries.map(([key, val]) => {
                    const pct = statusTotal > 0 ? Math.round((val / statusTotal) * 100) : 0;
                    const color = key === 'Approved' ? 'primary.main' : key === 'Pending' ? 'warning.main' : key === 'Rejected' ? 'error.main' : 'grey.400';
                    return (
                      <Box key={key}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography sx={{ fontWeight: 700 }}>{key}</Typography>
                          <Typography color="text.secondary">{val}</Typography>
                        </Stack>
                        <Box sx={{ height: 8, backgroundColor: 'divider', borderRadius: 1, mt: 1 }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 1 }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>Recent APIs</Typography>
              {(dashboard.recentApis || []).length === 0 ? (
                <Typography color="text.secondary">No recent APIs to show.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>API</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Version</TableCell>
                        <TableCell>Status</TableCell>
                        {hasSubscribersPerApi && <TableCell align="right">Subscribers</TableCell>}
                        {hasLastUpdated && <TableCell>Last Updated</TableCell>}
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(dashboard.recentApis || []).map((api) => (
                        <TableRow key={api.id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar src={api.logo} sx={{ width: 32, height: 32 }} />
                              <Box>
                                <Typography fontWeight={700}>{api.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{api.shortDescription || ''}</Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{api.categoryName || '-'}</TableCell>
                          <TableCell>{api.version || '-'}</TableCell>
                          <TableCell>
                            <Chip label={api.status || 'Unknown'} size="small" color={api.status === 'APPROVED' ? 'primary' : api.status === 'PENDING' ? 'warning' : api.status === 'REJECTED' ? 'error' : 'default'} />
                          </TableCell>
                          {hasSubscribersPerApi && <TableCell align="right">{api.subscribers != null ? api.subscribers : '-'}</TableCell>}
                          {hasLastUpdated && <TableCell>{api.lastUpdated ? new Date(api.lastUpdated).toLocaleString() : '-'}</TableCell>}
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button component={Link} to={`/provider/apis/${api.id}`} size="small">View</Button>
                              <Button component={Link} to={`/provider/apis/${api.id}/edit`} size="small" variant="outlined">Edit</Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Stack>
        </AppCard>
      </Grid>

      <Grid item xs={12} md={5}>
        <Stack spacing={2}>
          <AppCard title="Revenue" subtitle="Monthly revenue from active subscriptions">
            <Typography variant="h4" fontWeight={800}>{dashboard.monthlyRevenue != null ? formatCurrency(dashboard.monthlyRevenue) : 'Unavailable'}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Monthly revenue</Typography>
          </AppCard>

          <AppCard title="Quick Actions">
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button component={Link} to="/provider/apis/create" variant="contained">+ Create API</Button>
              <Button component={Link} to="/provider/apis" variant="outlined">Manage APIs</Button>
              <Button component={Link} to="/provider/profile" variant="outlined">View Profile</Button>
            </Stack>
          </AppCard>
        </Stack>
      </Grid>
    </Grid>
  </DashboardLayout>;
};

export default ProviderDashboardPage;
