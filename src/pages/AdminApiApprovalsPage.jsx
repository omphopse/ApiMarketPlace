import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Grid, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';
import { statusConfig } from '../config/statusConfig';
import { formatCurrency, formatNumber } from '../utils/formatters';

const AdminApiApprovalsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [queue, setQueue] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'PENDING', category: '', provider: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getApprovalQueue(filters);
      setQueue(response.content || []);
    } catch (err) {
      setError(err.message || 'Unable to load approval queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQueue(); }, [filters.status, filters.category, filters.provider]);

  useEffect(() => {
    const timeout = setTimeout(() => { loadQueue(); }, 250);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  const summary = useMemo(() => ({
    pending: queue.filter((api) => api.status === 'PENDING').length,
    approved: queue.filter((api) => api.status === 'APPROVED').length,
    rejected: queue.filter((api) => api.status === 'REJECTED').length,
    averageReviewTime: '12h'
  }), [queue]);

  if (loading) return <DashboardLayout role="ADMIN" title="API approvals" subtitle="Review marketplace submissions."><LoadingState title="Loading approvals" description="Gathering the review queue." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="API approvals" subtitle="Review marketplace submissions."><ErrorState message={error} retryLabel="Try again" onRetry={loadQueue} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="API approvals" subtitle="Review APIs submitted by providers before publishing.">
      <PageHeader title="API Approvals" subtitle="Review APIs submitted by providers before they are published to the marketplace." action={<Button variant="contained" onClick={() => navigate('/admin/api-approvals')}>Refresh</Button>} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Review', value: summary.pending },
          { label: 'Approved Today', value: summary.approved },
          { label: 'Rejected Today', value: summary.rejected },
          { label: 'Average Review Time', value: summary.averageReviewTime }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="h5" fontWeight={700}>{item.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
      <AppCard title="Approval queue" subtitle="Search, filter and review submissions.">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField label="Search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value }) } fullWidth size="small" />
          <TextField select label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} size="small" sx={{ minWidth: 180 }}>
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField label="Category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} size="small" />
          <TextField label="Provider" value={filters.provider} onChange={(event) => setFilters({ ...filters, provider: event.target.value })} size="small" />
        </Stack>
        {queue.length === 0 ? (
          <EmptyState title="You're all caught up." description="There are no APIs waiting for review." actionLabel="Reset mock data" actionTo="/dev/routes" />
        ) : isMobile ? (
          <Stack spacing={2}>
            {queue.map((api) => (
              <Card key={api.id} sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography fontWeight={700}>{api.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{api.providerName || 'Northstar Labs'} • {api.category}</Typography>
                  </Box>
                  <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{api.shortDescription}</Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">{api.plans?.length || 0} plans • {api.documentation ? 'Docs' : 'No docs'}</Typography>
                  <Button size="small" variant="contained" onClick={() => navigate(`/admin/api-approvals/${api.id}`)}>Review</Button>
                </Box>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>API</Box>
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Provider</Box>
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Category</Box>
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Submitted</Box>
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Plans</Box>
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Status</Box>
                  <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Actions</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {queue.map((api) => (
                  <Box component="tr" key={api.id}>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box component="img" src={api.logo} alt={api.name} sx={{ width: 40, height: 40, borderRadius: 2, objectFit: 'cover' }} />
                        <Box>
                          <Typography fontWeight={700}>{api.name}</Typography>
                          <Typography variant="body2" color="text.secondary">v{api.version}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{api.providerName || 'Northstar Labs'}</Box>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{api.category}</Box>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{new Date(api.createdAt).toLocaleDateString()}</Box>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{api.plans?.length || 0}</Box>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" /></Box>
                    <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Button size="small" variant="contained" onClick={() => navigate(`/admin/api-approvals/${api.id}`)}>Review</Button></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </AppCard>
    </DashboardLayout>
  );
};

export default AdminApiApprovalsPage;
